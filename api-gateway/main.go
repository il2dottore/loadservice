package main

import (
	"encoding/json"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"slices"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type ProxyConfig struct {
	Modules map[string]string `json:"modules"`
	Sockets map[string]string `json:"sockets"`
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

func NewProxy(target string, publicPrefix, upstreamPrefix string) *httputil.ReverseProxy {
	targetURL, err := url.Parse(target)
	if err != nil {
		log.Fatalf("invalid upstream URL %q: %v", target, err)
	}
	proxy := httputil.NewSingleHostReverseProxy(targetURL)
	director := proxy.Director
	proxy.Director = func(r *http.Request) {
		director(r)
		if upstreamPrefix != "" {
			suffix := strings.TrimPrefix(r.URL.Path, publicPrefix)
			r.URL.Path = strings.TrimRight(upstreamPrefix, "/") + "/" + strings.TrimLeft(suffix, "/")
			r.URL.RawPath = ""
		}
	}
	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		log.Printf("proxy %s %s: %v", r.Method, r.URL.Path, err)
		http.Error(w, "upstream service unavailable", http.StatusBadGateway)
	}
	return proxy
}

func main() {
	if err := godotenv.Load(); err != nil && !os.IsNotExist(err) {
		log.Fatalf("cannot read .env file: %v", err)
	}
	config := LoadConfig(os.Getenv("PROXY_CONFIG"))
	routes := make(map[string]*httputil.ReverseProxy, len(config.Modules)+len(config.Sockets))
	for module, fullURL := range config.Modules {
		parsedURL, err := url.Parse(fullURL)
		if err != nil || parsedURL.Path == "" {
			log.Fatalf("invalid URL for module %s: %q", module, fullURL)
		}
		upstream := parsedURL.Scheme + "://" + parsedURL.Host
		routes[parsedURL.Path] = NewProxy(upstream, "", "")
		log.Printf("module %s: %s -> %s", module, parsedURL.Path, upstream)
	}
	for publicPath, fullURL := range config.Sockets {
		parsedURL, err := url.Parse(fullURL)
		if err != nil || parsedURL.Scheme == "" || parsedURL.Host == "" || !strings.HasPrefix(publicPath, "/socket.io/") {
			log.Fatalf("invalid socket route %s: %q", publicPath, fullURL)
		}
		upstream := parsedURL.Scheme + "://" + parsedURL.Host
		routes[publicPath] = NewProxy(upstream, publicPath, "/socket.io/")
		log.Printf("socket %s -> %s/socket.io/", publicPath, upstream)
	}
	prefixes := make([]string, 0, len(routes))
	for prefix := range routes {
		prefixes = append(prefixes, prefix)
	}
	// Prefer the longest prefix so socket routes cannot be shadowed by a shorter route.
	slices.SortFunc(prefixes, func(a, b string) int { return len(b) - len(a) })

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		for _, prefix := range prefixes {
			proxy := routes[prefix]
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
