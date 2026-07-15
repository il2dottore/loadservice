package main

import (
	"bytes"
	"encoding/json"
	amqp "github.com/rabbitmq/amqp091-go"
	"log"
	"net/http"
	"os"
	"sort"
	"time"
)

type node struct {
	URL    string
	Active int64
	CPU    float64
	Memory float64
}
type event struct {
	ID            int    `json:"id"`
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

type rmqEvent struct {
	Pattern string          `json:"pattern"`
	Data    json.RawMessage `json:"data"`
}

var statusChannel *amqp.Channel

func main() {
	url := getenv("RABBITMQ_URL", "amqp://sussybaka:sussybakadeptrai@localhost:5672/")
	queue := getenv("RABBITMQ_ATTACK_QUEUE", "attack.events")
	nodes := split(getenv("ATTACK_NODES", "http://localhost:2005"))
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
		if envelope.Pattern != "attack.fired" || json.Unmarshal(envelope.Data, &e) != nil {
			log.Printf("unsupported attack event pattern %q", envelope.Pattern)
			m.Nack(false, false)
			continue
		}
		log.Printf("[ATTACK-ROUTER] attack %d parsed: target=%s method=%s layer=%s duration=%ds rate=%d", e.ID, e.Target, e.Method, e.Layer, e.Duration, e.RateLimit)
		if err := dispatch(e, nodes); err != nil {
			log.Printf("attack %d: %v", e.ID, err)
			publishStatus(e, "FAILED", err.Error())
			m.Nack(false, true)
		} else {
			m.Ack(false)
		}
	}
}

func publishStatus(e event, status, reason string) {
	body, _ := json.Marshal(map[string]any{
		"pattern": "attack.updateStatus",
		"data":    map[string]any{"id": e.ID, "status": status, "failureReason": reason, "slotKey": e.SlotKey},
	})
	_ = statusChannel.Publish("", getenv("RABBITMQ_ATTACK_STATUS_QUEUE", "attack.status.events"), false, false, amqp.Publishing{DeliveryMode: amqp.Persistent, ContentType: "application/json", Body: body})
}
func dispatch(e event, urls []string) error {
	log.Printf("[ATTACK-ROUTER] attack %d checking %d attack node(s)", e.ID, len(urls))
	ns := make([]node, 0, len(urls))
	c := http.Client{Timeout: 2 * time.Second}
	for _, u := range urls {
		log.Printf("[ATTACK-ROUTER] attack %d health check: %s", e.ID, u)
		var n node
		r, err := c.Get(u + "/health")
		if err != nil {
			log.Printf("[ATTACK-ROUTER] attack %d node unavailable: %s (%v)", e.ID, u, err)
			continue
		}
		json.NewDecoder(r.Body).Decode(&n)
		r.Body.Close()
		n.URL = u
		ns = append(ns, n)
		log.Printf("[ATTACK-ROUTER] node healthy: %s active=%d cpu=%.1f%% memory=%.1f%%", u, n.Active, n.CPU, n.Memory)
	}
	if len(ns) == 0 {
		log.Printf("[ATTACK-ROUTER] attack %d failed: no healthy nodes", e.ID)
		return &noNodes{}
	}
	sort.Slice(ns, func(i, j int) bool { return ns[i].Active < ns[j].Active })
	log.Printf("[ATTACK-ROUTER] attack %d selected node: %s", e.ID, ns[0].URL)
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
