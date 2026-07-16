package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	amqp "github.com/rabbitmq/amqp091-go"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

type node struct {
	URL      string
	MaxSlots int
	Active   int64
	CPU      float64
	Memory   float64
}
type event struct {
	ID             int    `json:"id"`
	UserID         string `json:"userId"`
	AllowedServers []struct {
		Address string `json:"address"`
		Slots   int    `json:"slots"`
	} `json:"allowedServers"`
	Target        string `json:"target"`
	Duration      int    `json:"duration"`
	Method        string `json:"method"`
	Layer         string `json:"layer"`
	Port          int    `json:"port"`
	PPSLimit      int    `json:"ppsLimit"`
	RateLimit     int    `json:"rateLimit"`
	RequestMethod string `json:"requestMethod"`
	PostData      string `json:"postData"`
	SlotKey       string `json:"slotKey"`
}

// NestJS messed this up, so I must define this.
type rmqEvent struct {
	Pattern string          `json:"pattern"`
	Data    json.RawMessage `json:"data"`
}
type cancelEvent struct {
	ID int `json:"id"`
}

var statusChannel *amqp.Channel
var assigned = struct {
	sync.Mutex
	nodes map[int]string
}{nodes: make(map[int]string)}

func main() {
	loadDotEnv(getenv(".env"))
	url := getenv("RABBITMQ_URL", "amqp://sussybaka:sussybakadeptrai@localhost:5672/")
	queue := getenv("RABBITMQ_ATTACK_QUEUE", "attack.events")
	conn, err := amqp.Dial(url)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()
	ch, err := conn.Channel()
	if err != nil {
		log.Fatal(err)
	}
	defer ch.Close()
	statusChannel, err = conn.Channel()
	if err != nil {
		log.Fatal(err)
	}
	defer statusChannel.Close()
	q, err := ch.QueueDeclare(queue, true, false, false, false, nil)
	if err != nil {
		log.Fatal(err)
	}
	msgs, err := ch.Consume(q.Name, "", false, false, false, false, nil)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("router listening on %s", queue)
	for m := range msgs {
		log.Printf("[ATTACK-ROUTER] received message: %s", string(m.Body))
		var e event
		var envelope rmqEvent
		if json.Unmarshal(m.Body, &envelope) != nil || len(envelope.Data) == 0 {
			log.Printf("[ATTACK-ROUTER] invalid RabbitMQ envelope; message discarded")
			m.Nack(false, false)
			continue
		}
		if envelope.Pattern == "attack.cancel" {
			var cancel cancelEvent
			if json.Unmarshal(envelope.Data, &cancel) == nil {
				cancelAttack(cancel.ID)
			}
			m.Ack(false)
			continue
		}
		if envelope.Pattern != "attack.fired" || json.Unmarshal(envelope.Data, &e) != nil {
			log.Printf("unsupported attack event pattern %q", envelope.Pattern)
			m.Nack(false, false)
			continue
		}
		log.Printf("[ATTACK-ROUTER] attack %d parsed: target=%s method=%s layer=%s duration=%ds rate=%d", e.ID, e.Target, e.Method, e.Layer, e.Duration, e.RateLimit)
		if err := dispatch(e); err != nil {
			log.Printf("attack %d: %v", e.ID, err)
			publishStatus(e, "FAILED", err.Error())
			// The failure has been handled and persisted through the status event.
			// Requeueing would dispatch the same attack and emit FAILED repeatedly.
			m.Ack(false)
		} else {
			m.Ack(false)
		}
	}
}

func cancelAttack(id int) {
	assigned.Lock()
	u := assigned.nodes[id]
	delete(assigned.nodes, id)
	assigned.Unlock()
	if u == "" {
		return
	}
	c := http.Client{Timeout: 2 * time.Second}
	r, err := c.Post(fmt.Sprintf("%s/attacks/%d/stop", u, id), "application/json", nil)
	if err != nil {
		log.Printf("[ATTACK-ROUTER] attack %d stop failed: %v", id, err)
		return
	}
	r.Body.Close()
}

func publishStatus(e event, status, reason string) {
	body, _ := json.Marshal(map[string]any{
		"pattern": "attack.updateStatus",
		"data":    map[string]any{"id": e.ID, "status": status, "failureReason": reason, "slotKey": e.SlotKey},
	})
	_ = statusChannel.Publish("", getenv("RABBITMQ_ATTACK_STATUS_QUEUE", "attack.status.events"), false, false, amqp.Publishing{DeliveryMode: amqp.Persistent, ContentType: "application/json", Body: body})
}
func allowedNodes(e event) ([]node, error) {
	protocol, port := getenv("ATTACK_NODE_PROTOCOL", "http"), getenv("ATTACK_NODE_PORT", "2005")
	urls := make([]node, 0, len(e.AllowedServers))
	for _, server := range e.AllowedServers {
		if server.Address != "" {
			urls = append(urls, node{URL: fmt.Sprintf("%s://%s:%s", protocol, server.Address, port), MaxSlots: server.Slots})
		}
	}
	return urls, nil
}

func dispatch(e event) error {
	allowed, err := allowedNodes(e)
	if err != nil {
		return err
	}
	log.Printf("[ATTACK-ROUTER] attack %d checking %d attack node(s)", e.ID, len(allowed))
	ns := make([]node, 0, len(allowed))
	c := http.Client{Timeout: 2 * time.Second}
	results := make(chan node, len(allowed))
	var wg sync.WaitGroup
	var fullNodes int
	var fullMu sync.Mutex
	for _, allowedNode := range allowed {
		u := allowedNode.URL
		wg.Add(1)
		go func(url string, maxSlots int) {
			defer wg.Done()
			log.Printf("[ATTACK-ROUTER] attack %d health check: %s", e.ID, url)
			var n node
			r, err := c.Get(url + "/health")
			if err != nil {
				log.Printf("[ATTACK-ROUTER] attack %d node unavailable: %s (%v)", e.ID, url, err)
				return
			}
			defer r.Body.Close()
			if r.StatusCode >= 300 || json.NewDecoder(r.Body).Decode(&n) != nil {
				log.Printf("[ATTACK-ROUTER] attack %d invalid health response: %s", e.ID, url)
				return
			}
			n.URL = url
			n.MaxSlots = maxSlots
			if n.Active >= int64(n.MaxSlots) {
				log.Printf("[ATTACK-ROUTER] node full: %s active=%d max=%d", url, n.Active, n.MaxSlots)
				fullMu.Lock()
				fullNodes++
				fullMu.Unlock()
				return
			}
			results <- n
		}(u, allowedNode.MaxSlots)
	}
	wg.Wait()
	close(results)
	for n := range results {
		ns = append(ns, n)
		log.Printf("[ATTACK-ROUTER] node healthy: %s active=%d cpu=%.1f%% memory=%.1f%%", n.URL, n.Active, n.CPU, n.Memory)
	}
	if len(ns) == 0 {
		log.Printf("[ATTACK-ROUTER] attack %d failed: no healthy nodes", e.ID)
		if fullNodes == len(allowed) && len(allowed) > 0 {
			return &overloaded{}
		}
		return &noNodes{}
	}
	sort.Slice(ns, func(i, j int) bool { return ns[i].Active < ns[j].Active })
	log.Printf("[ATTACK-ROUTER] attack %d selected node: %s", e.ID, ns[0].URL)
	assigned.Lock()
	assigned.nodes[e.ID] = ns[0].URL
	assigned.Unlock()
	b, _ := json.Marshal(e)
	r, err := c.Post(ns[0].URL+"/attacks", "application/json", bytes.NewReader(b))
	if err != nil {
		log.Printf("[ATTACK-ROUTER] attack %d dispatch error: %v", e.ID, err)
		return err
	}
	defer r.Body.Close()
	if r.StatusCode >= 300 {
		log.Printf("[ATTACK-ROUTER] attack %d node rejected request: HTTP %d", e.ID, r.StatusCode)
		return &badStatus{r.StatusCode}
	}
	log.Printf("[ATTACK-ROUTER] attack %d accepted by node: HTTP %d", e.ID, r.StatusCode)
	return nil
}

type noNodes struct{}

func (*noNodes) Error() string { return "no healthy attack nodes" }

type overloaded struct{}

func (*overloaded) Error() string {
	return "Hệ thống đang quá tải, tất cả server hiện đã đầy slot"
}

type badStatus struct{ code int }

func (e *badStatus) Error() string { return http.StatusText(e.code) }
func getenv(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}
func split(s string) []string {
	var r []string
	for _, v := range bytes.Split([]byte(s), []byte(",")) {
		if len(v) > 0 {
			r = append(r, string(v))
		}
	}
	return r
}

func loadDotEnv(path string) {
	b, err := os.ReadFile(filepath.Clean(path))
	if err != nil {
		if !os.IsNotExist(err) {
			log.Printf("unable to read %s: %v", path, err)
		}
		return
	}
	for _, line := range strings.Split(string(b), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		p := strings.SplitN(line, "=", 2)
		if len(p) != 2 {
			continue
		}
		k, v := strings.TrimSpace(p[0]), strings.Trim(strings.TrimSpace(p[1]), "\"'")
		if k != "" && os.Getenv(k) == "" {
			_ = os.Setenv(k, v)
		}
	}
}
