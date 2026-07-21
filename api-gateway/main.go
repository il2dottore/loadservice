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

	"github.com/joho/godotenv"
)

type ProxyConfig struct {
	Modules map[string]string `json:"modules"`
}

func LoadConfig(path string) ProxyConfig {
	data, err := os.ReadFile(path)
	if err != nil {
		log.Fatalf("cannot read proxy config %q: %v", path, err)
	}
	var config ProxyConfig
	if err := json.Unmarshal(data, &config); err != nil {
		log.Fatalf("cannot parse proxy config %q: %v", path, err)
	}
	if len(config.Modules) == 0 {
		log.Fatalf("proxy config %q does not define any modules", path)
	}
	return config
}

func NewProxy(target string) *httputil.ReverseProxy {
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
	if err := godotenv.Load(); err != nil {
		log.Fatalf("cannot read .env file: %v", err)
	}
	config := LoadConfig(os.Getenv("PROXY_CONFIG"))
	// There're some trouble about Socket.IO here so don't put socket gateway to this reverse proxy.
	routes := make(map[string]*httputil.ReverseProxy, len(config.Modules))
	for module, fullURL := range config.Modules {
		parsedURL, err := url.Parse(fullURL)
		if err != nil || parsedURL.Path == "" {
			log.Fatalf("invalid URL for module %s: %q", module, fullURL)
		}
		upstream := parsedURL.Scheme + "://" + parsedURL.Host
		routes[parsedURL.Path] = NewProxy(upstream)
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
		Addr:              "0.0.0.0:" + os.Getenv("LISTEN_PORT"),
		Handler:           handler,
		ReadHeaderTimeout: 10 * time.Second,
	}
	log.Printf("reverse proxy listening on %s", server.Addr)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
