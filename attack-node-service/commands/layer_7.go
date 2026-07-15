package commands

var Layer7Methods = map[string]string{
	"HTTP_FREE": "cd scripts && node index.js {{.Target}} {{.Duration}} {{.Rate}} 1 output.txt socks5",
}
