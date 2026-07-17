package main

import (
	"encoding/json"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
	"time"
)

const defaultListenAddr = "0.0.0.0:8080"
const defaultConfigFile = "config.json"

type proxyConfig struct {
	ListenAddr string            `json:"listenAddr"`
	Modules    map[string]string `json:"modules"`
}

func loadConfig(path string) proxyConfig {
	data, err := os.ReadFile(path)
	if err != nil {
		log.Fatalf("cannot read proxy config %q: %v", path, err)
	}
	var config proxyConfig
	if err := json.Unmarshal(data, &config); err != nil {
		log.Fatalf("cannot parse proxy config %q: %v", path, err)
	}
	if config.ListenAddr == "" {
		config.ListenAddr = defaultListenAddr
	}
	if len(config.Modules) == 0 {
		log.Fatalf("proxy config %q does not define any modules", path)
	}
	return config
}

func loadDotEnv(path string) {
	data, err := os.ReadFile(path)
	if err != nil {
		if !os.IsNotExist(err) {
			log.Printf("cannot read dotenv file %q: %v", path, err)
		}
		return
	}

	for _, line := range strings.Split(string(data), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		key = strings.TrimSpace(key)
		value = strings.Trim(strings.TrimSpace(value), "\"'")
		if key != "" {
			if _, exists := os.LookupEnv(key); !exists {
				_ = os.Setenv(key, value)
			}
		}
	}
}

func newProxy(target string) *httputil.ReverseProxy {
	targetURL, err := url.Parse(target)
	if err != nil {
		log.Fatalf("invalid upstream URL %q: %v", target, err)
	}
	proxy := httputil.NewSingleHostReverseProxy(targetURL)
	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		log.Printf("proxy %s %s: %v", r.Method, r.URL.Path, err)
		http.Error(w, "upstream service unavailable", http.StatusBadGateway)
	}
	return proxy
}

func main() {
	loadDotEnv(".env")
	config := loadConfig(envOrDefault("PROXY_CONFIG", defaultConfigFile))
	// There're some trouble about Socket.IO here so don't put socket gateway to this reverse proxy.
	routes := make(map[string]*httputil.ReverseProxy, len(config.Modules))
	for module, fullURL := range config.Modules {
		parsedURL, err := url.Parse(fullURL)
		if err != nil || parsedURL.Path == "" {
			log.Fatalf("invalid URL for module %s: %q", module, fullURL)
		}
		upstream := parsedURL.Scheme + "://" + parsedURL.Host
		routes[parsedURL.Path] = newProxy(upstream)
		log.Printf("module %s: %s -> %s", module, parsedURL.Path, upstream)
	}

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		for prefix, proxy := range routes {
			if r.URL.Path == prefix || strings.HasPrefix(r.URL.Path, prefix+"/") {
				proxy.ServeHTTP(w, r)
				return
			}
		}
		http.NotFound(w, r)
	})

	server := &http.Server{
		Addr:              envOrDefault("PROXY_ADDR", config.ListenAddr),
		Handler:           handler,
		ReadHeaderTimeout: 10 * time.Second,
	}
	log.Printf("reverse proxy listening on %s", server.Addr)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}

func envOrDefault(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
