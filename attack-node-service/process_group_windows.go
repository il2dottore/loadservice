//go:build windows

package main

import (
	"os"
	"syscall"
)

// Windows does not support Unix process groups or syscall.Setpgid.
// The process itself is still terminated when an attack is stopped.
func processGroupAttr() *syscall.SysProcAttr {
	return nil
}

func killProcessGroup(pid int) error {
	process, err := os.FindProcess(pid)
	if err != nil {
		return err
	}
	return process.Kill()
}
