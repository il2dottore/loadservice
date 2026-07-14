package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
	"time"
)

const defaultListenAddr = ":8080"

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
	// Each entry is: module name -> complete NestJS module URL.
	modules := map[string]string{
		"auth":        "http://localhost:3000/api/v1/auth",
		"users":       "http://localhost:3000/api/v1/users",
		"roles":       "http://localhost:3000/api/v1/roles",
		"permissions": "http://localhost:3000/api/v1/permissions",
		"features":    "http://localhost:3000/api/v1/features",
		"news":        "http://localhost:3000/api/v1/news",
		"plans":       "http://localhost:3000/api/v1/plans",
		"tickets":     "http://localhost:3000/api/v1/tickets",
		"attacks":     "http://localhost:4000/api/v1/attacks",
		"methods":     "http://localhost:4000/api/v1/methods",
		"networks":    "http://localhost:4000/api/v1/networks",
		"servers":     "http://localhost:4000/api/v1/servers",
	}
	routes := make(map[string]*httputil.ReverseProxy, len(modules))
	for module, fullURL := range modules {
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
		Addr:              envOrDefault("PROXY_ADDR", defaultListenAddr),
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
