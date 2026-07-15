package commands

import (
	"encoding/json"
	"fmt"
	"os"
)

var Layer7Methods = map[string]string{}
var Layer4Methods = map[string]string{}

type file struct {
	Layer7 map[string]string `json:"layer7"`
	Layer4 map[string]string `json:"layer4"`
}

func Load(path string) error {
	b, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("read commands file %q: %w", path, err)
	}
	var c file
	if err := json.Unmarshal(b, &c); err != nil {
		return fmt.Errorf("parse commands file %q: %w", path, err)
	}
	if c.Layer7 == nil {
		c.Layer7 = map[string]string{}
	}
	if c.Layer4 == nil {
		c.Layer4 = map[string]string{}
	}
	Layer7Methods, Layer4Methods = c.Layer7, c.Layer4
	return nil
}
