package commands

var Layer7Methods = map[string]string{
	"HTTP_FREE": "cd scripts && node index.js {{.Target}} {{.Duration}} {{.Rate}} 2 proxies.txt socks5",
}
