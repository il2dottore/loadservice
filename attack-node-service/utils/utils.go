package utils

import (
	"os/exec"
)

func ShellExec(shellCommand string) error {
	return exec.Command("/bin/sh", "-c", shellCommand).Run()
}
