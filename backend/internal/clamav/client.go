package clamav

import (
	"bufio"
	"context"
	"encoding/binary"
	"fmt"
	"io"
	"net"
	"strings"
	"time"
)

const chunkSize = 32 * 1024

type Client struct {
	addr    string
	timeout time.Duration
}

func New(addr string) *Client {
	return &Client{
		addr:    addr,
		timeout: 15 * time.Second,
	}
}

func (c *Client) ScanStream(ctx context.Context, r io.Reader) (bool, error) {
	if err := ctx.Err(); err != nil {
		return false, fmt.Errorf("scan canceled: %w", err)
	}

	conn, err := dialContext(ctx, c.addr)
	if err != nil {
		return false, fmt.Errorf("connect to clamd: %w", err)
	}
	defer conn.Close()

	if err := conn.SetDeadline(time.Now().Add(c.timeout)); err != nil {
		return false, fmt.Errorf("set initial deadline: %w", err)
	}

	if _, err := conn.Write([]byte("zINSTREAM\x00")); err != nil {
		return false, fmt.Errorf("send zINSTREAM: %w", err)
	}

	frame := make([]byte, 4+chunkSize)

	var streamAborted = normalExit

	for {
		if err := ctx.Err(); err != nil {
			return false, fmt.Errorf("scan canceled during upload: %w", err)
		}

		n, readErr := r.Read(frame[4:])
		if n > 0 {
			binary.BigEndian.PutUint32(frame[:4], uint32(n))
			_ = conn.SetDeadline(time.Now().Add(c.timeout))
			if _, wErr := conn.Write(frame[:4+n]); wErr != nil {
				streamAborted = writeError
				break
			}
		}
		if readErr != nil {
			if readErr == io.EOF {
				break
			}
			return false, fmt.Errorf("read file: %w", readErr)
		}
	}

	if streamAborted == normalExit {
		var terminator [4]byte
		_, _ = conn.Write(terminator[:])
	}

	_ = conn.SetDeadline(time.Now().Add(c.timeout))
	limitedReader := io.LimitReader(conn, 512)
	reader := bufio.NewReader(limitedReader)

	respBytes, err := reader.ReadBytes('\x00')
	if err != nil && err != io.EOF {
		return false, fmt.Errorf("read clamd response: %w", err)
	}

	if len(respBytes) == 0 && streamAborted == writeError {
		return false, fmt.Errorf("clamd dropped connection unexpectedly during upload")
	}

	result := strings.TrimRight(string(respBytes), "\n\r\x00")
	if result == "stream: OK" {
		return true, nil
	}
	if strings.HasSuffix(result, "FOUND") {
		return false, nil
	}
	if strings.HasSuffix(result, "ERROR") {
		return false, fmt.Errorf("clamd internal error: %s", result)
	}

	return false, fmt.Errorf("unexpected clamd response: %q", result)
}

type earlyAbortReason int
const (
	normalExit earlyAbortReason = iota
	writeError
)

func dialContext(ctx context.Context, addr string) (net.Conn, error) {
	var d net.Dialer
	conn, err := d.DialContext(ctx, "tcp", addr)
	if err != nil {
		return nil, err
	}
	return conn, nil
}
