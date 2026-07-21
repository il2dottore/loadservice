package main

import (
	"encoding/json"
	"fmt"
	"os"
)

var Layer7Methods = map[string]string{}
var Layer4Methods = map[string]string{}

type MethodConfig struct {
	Layer7 map[string]string `json:"layer7"`
	Layer4 map[string]string `json:"layer4"`
}

func LoadCommandConfig(path string) error {
	bytes, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("read commands file %q: %w", path, err)
	}
	var methodConfig MethodConfig
	if err := json.Unmarshal(bytes, &methodConfig); err != nil {
		return fmt.Errorf("parse commands file %q: %w", path, err)
	}
	if methodConfig.Layer7 == nil {
		methodConfig.Layer7 = map[string]string{}
	}
	if methodConfig.Layer4 == nil {
		methodConfig.Layer4 = map[string]string{}
	}
	Layer7Methods, Layer4Methods = methodConfig.Layer7, methodConfig.Layer4
	return nil
}
