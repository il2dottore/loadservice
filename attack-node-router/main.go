/**
 * Receives attack.fired event
 * Selects best node based on health checks
 * Dispatches attack to the node
 * Publishes attack.updateStatus event
 */

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/joho/godotenv"
	amqp "github.com/rabbitmq/amqp091-go"
)

type Node struct {
	URL      string
	MaxSlots int
	Active   int64
	CPU      float64
	Memory   float64
}

// Attack event sent from NestJS attack service
// backend/apps/attack/src/attack/attack.service.ts: this.attackClient.emit('attack.fired', {...})
type AttackEvent struct {
	ID             int    `json:"id"`
	UserID         string `json:"userId"`
	AllowedServers []struct {
		ID      int    `json:"id"`
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
	ServerID      int    `json:"serverId"`
}

// NestJS messed this up, so I must define this.
type RMQEvent struct {
	Pattern string          `json:"pattern"`
	Data    json.RawMessage `json:"data"`
}

type CancelEvent struct {
	AttackID int `json:"id"`
}

var statusChannel *amqp.Channel

var assigned = struct {
	sync.Mutex
	nodes map[int]string
}{
	nodes: make(map[int]string),
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatalf("cannot read .env file: %v", err)
	}
	rabbitMqUrl := os.Getenv("RABBITMQ_URL")
	attackQueueKey := os.Getenv("RABBITMQ_ATTACK_QUEUE")

	// Dial connection to RabbitMQ server
	conn, err := amqp.Dial(rabbitMqUrl)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	// Attack channel
	attackChannel, err := conn.Channel()
	if err != nil {
		log.Fatal(err)
	}
	defer attackChannel.Close()
	// Attack status channel
	statusChannel, err = conn.Channel()
	if err != nil {
		log.Fatal(err)
	}
	defer statusChannel.Close()

	// Create `RABBITMQ_ATTACK_QUEUE` in RabbitMQ (if already existed, use the current one)
	// Only DECLARE, not sending or receiving
	attackQueue, err := attackChannel.QueueDeclare(attackQueueKey, true, false, false, false, nil)
	if err != nil {
		log.Fatal(err)
	}
	// Consome `RABBITMQ_ATTACK_QUEUE`, from now on, this will handle every message goes to this queue.
	attackJobConsumer, err := attackChannel.Consume(attackQueue.Name, "", false, false, false, false, nil)
	if err != nil {
		log.Fatal(err)
	}

	log.Printf("router listening on %s", attackQueueKey)
	for attackJob := range attackJobConsumer {
		log.Printf("[attack-node-router] received message: %s", string(attackJob.Body))
		var attackEvent AttackEvent
		// Shit wrapped response generated from NestJS
		var envelope RMQEvent

		// Malformed response
		if json.Unmarshal(attackJob.Body, &envelope) != nil || len(envelope.Data) == 0 {
			log.Printf("[attack-node-router] invalid RabbitMQ envelope; message discarded")
			// 1st `false`: Inform RabbitMQ that this consumer failed to proceed this job
			// 2nd `false`: Inform RabbitMQ to drop only this job
			attackJob.Nack(false, false)
			continue
		}

		// If receives cancellation request
		if envelope.Pattern == "attack.cancel" {
			var cancelEvent CancelEvent
			if json.Unmarshal(envelope.Data, &cancelEvent) == nil {
				// Send cancellation request to attack node
				CancelAttack(cancelEvent.AttackID)
			}
			// Inform RabbitMQ to drop this job because it had been done (User manually stops it)
			attackJob.Ack(false)
			continue
		}

		// An error occured when parsing
		if envelope.Pattern != "attack.fired" || json.Unmarshal(envelope.Data, &attackEvent) != nil {
			log.Printf("unsupported attack event pattern %q", envelope.Pattern)
			attackJob.Nack(false, false)
			continue
		}

		// Main logic
		log.Printf("[attack-node-router] attack %d parsed: target=%s method=%s layer=%s duration=%ds rate=%d", attackEvent.ID, attackEvent.Target, attackEvent.Method, attackEvent.Layer, attackEvent.Duration, attackEvent.RateLimit)

		if err := Dispatch(attackEvent); err != nil {
			log.Printf("[attack-node-router] attack %d: %v", attackEvent.ID, err)
			PublishStatus(
				attackEvent,
				"FAILED",
				fmt.Sprintf("Failed to dispatch attack: %s", err.Error()),
			)
			attackJob.Ack(false)
		} else {
			attackJob.Ack(false)
		}
	}
}

func CancelAttack(id int) {
	assigned.Lock()
	u := assigned.nodes[id]
	delete(assigned.nodes, id)
	assigned.Unlock()
	if u == "" {
		return
	}
	httpClient := http.Client{
		Timeout: 2 * time.Second,
	}
	response, err := httpClient.Post(fmt.Sprintf("%s/attacks/%d/stop", u, id), "application/json", nil)
	if err != nil {
		log.Printf("[attack-node-router] attack %d stop failed: %v", id, err)
		return
	}
	response.Body.Close()
}

func PublishStatus(e AttackEvent, status, reason string) {
	body, _ := json.Marshal(map[string]any{
		"pattern": "attack.updateStatus",
		"data": map[string]any{
			"id":            e.ID,
			"status":        status,
			"failureReason": reason,
			"slotKey":       e.SlotKey,
		},
	})
	_ = statusChannel.Publish(
		"",
		os.Getenv("RABBITMQ_ATTACK_STATUS_QUEUE"),
		false,
		false,
		amqp.Publishing{
			DeliveryMode: amqp.Persistent,
			ContentType:  "application/json",
			Body:         body,
		},
	)
}

// Get `allowedServers` from `AttackEvent` and load it into an array of struct
func AllowedNodes(attackEvent AttackEvent) ([]Node, error) {
	protocol, port := os.Getenv("ATTACK_NODE_PROTOCOL"), os.Getenv("ATTACK_NODE_PORT")
	urls := make([]Node, 0, len(attackEvent.AllowedServers))
	for _, server := range attackEvent.AllowedServers {
		if server.Address != "" {
			node := Node{
				// For health check and APIs access.
				URL:      fmt.Sprintf("%s://%s:%s", protocol, server.Address, port),
				MaxSlots: server.Slots,
			}
			urls = append(urls, node)
		}
	}
	return urls, nil
}

func Dispatch(attackEvent AttackEvent) error {
	// Get `allowedServers` from `AttackEvent` and load it into an array of struct
	allowedServers, err := AllowedNodes(attackEvent)
	if err != nil {
		return err
	}
	// Log every allowed server
	log.Printf("[attack-node-router] attack %d checking %d attack node(s)", attackEvent.ID, len(allowedServers))

	// Create an array to store healthy nodes
	healthyNodeChan := make([]Node, 0, len(allowedServers))

	// Create a client for health check
	httpClient := http.Client{
		Timeout: 2 * time.Second,
	}

	// Channel to store healthy nodes
	results := make(chan Node, len(allowedServers))

	var waitGroup sync.WaitGroup
	var fullNodes int
	var fullMutex sync.Mutex

	// Loop through every allowed servers
	for _, allowedServer := range allowedServers {
		nodeUrl := allowedServer.URL
		waitGroup.Add(1)
		go func(nodeUrl string, maxSlots int) {
			defer waitGroup.Done()
			log.Printf("[attack-node-router] attack %d health check: %s", attackEvent.ID, nodeUrl)
			var attackNode Node

			/*
				Request to health endpoint `http://<attack-node-ip>:<attack-node-port>/health`
				{
				  "active": <int64>,
				  "cpu": <float64>,
				  "memory": <float64>
				}
			*/
			request, err := httpClient.Get(nodeUrl + "/health")
			if err != nil {
				log.Printf("[attack-node-router] attack %d node unavailable: %s (%v)", attackEvent.ID, nodeUrl, err)
				return
			}
			defer request.Body.Close()

			/*
			   If status code is greater than or equal to 300, it's unhealthy
			*/
			if request.StatusCode >= 300 || json.NewDecoder(request.Body).Decode(&attackNode) != nil {
				log.Printf("[attack-node-router] attack %d invalid health response: %s", attackEvent.ID, nodeUrl)
				return
			}

			attackNode.URL = nodeUrl
			attackNode.MaxSlots = maxSlots

			// For each full slots server, increase fullNodes by 1
			if attackNode.Active >= int64(attackNode.MaxSlots) {
				log.Printf("[attack-node-router] node full: %s active=%d max=%d", nodeUrl, attackNode.Active, attackNode.MaxSlots)
				fullMutex.Lock()
				fullNodes++
				fullMutex.Unlock()
				return
			}
			results <- attackNode
		}(nodeUrl, allowedServer.MaxSlots)
	}
	waitGroup.Wait()
	close(results)
	for healthyNode := range results {
		healthyNodeChan = append(healthyNodeChan, healthyNode)
		log.Printf("[attack-node-router] node healthy: %s active=%d cpu=%.1f%% memory=%.1f%%", healthyNode.URL, healthyNode.Active, healthyNode.CPU, healthyNode.Memory)
	}
	if len(healthyNodeChan) == 0 {
		log.Printf("[attack-node-router] attack %d failed: no healthy nodes", attackEvent.ID)
		if fullNodes == len(allowedServers) && len(allowedServers) > 0 {
			return &Overloaded{}
		}
		return &NoNodes{}
	}

	// Sort healthy nodes by number of running attack job (ascending order)
	sort.Slice(healthyNodeChan, func(i, j int) bool {
		return healthyNodeChan[i].Active < healthyNodeChan[j].Active
	})

	// Assign attack job to the least busy node
	log.Printf("[attack-node-router] attack %d selected node: %s", attackEvent.ID, healthyNodeChan[0].URL)
	for _, server := range attackEvent.AllowedServers {
		if strings.Contains(healthyNodeChan[0].URL, server.Address) {
			attackEvent.ServerID = server.ID
			break
		}
	}

	// Store assigned attack job
	assigned.Lock()
	assigned.nodes[attackEvent.ID] = healthyNodeChan[0].URL
	assigned.Unlock()

	// Send attack payload to selected node
	attackEventPayload, _ := json.Marshal(attackEvent)
	// attack-node-service/main.go:json.NewDecoder(request.Body).Decode(&raw)
	request, err := httpClient.Post(healthyNodeChan[0].URL+"/attacks", "application/json", bytes.NewReader(attackEventPayload))
	if err != nil {
		log.Printf("[attack-node-router] attack %d dispatch error: %v", attackEvent.ID, err)
		return err
	}
	defer request.Body.Close()
	if request.StatusCode >= 300 {
		log.Printf("[attack-node-router] attack %d node rejected request: HTTP %d", attackEvent.ID, request.StatusCode)
		return &BadStatus{request.StatusCode}
	}
	log.Printf("[attack-node-router] attack %d accepted by node: HTTP %d", attackEvent.ID, request.StatusCode)
	return nil
}

type NoNodes struct{}

func (*NoNodes) Error() string {
	return "No healthy attack nodes"
}

type Overloaded struct{}

func (*Overloaded) Error() string {
	return "System is overloaded, all servers are currently full"
}

type BadStatus struct {
	code int
}

func (e *BadStatus) Error() string {
	return http.StatusText(e.code)
}

func split(s string) []string {
	var r []string
	for v := range bytes.SplitSeq([]byte(s), []byte(",")) {
		if len(v) > 0 {
			r = append(r, string(v))
		}
	}
	return r
}
