package utils

import (
	"net"
	"net/http"
	// "strings"
)

func RealIP(r *http.Request) string {
	// Only uncomment this if you use proxy, load balancer, cdn, etc...
	// if ip := r.Header.Get("X-Real-IP"); ip != "" {
	// 	return ip
	// }
	// if fwd := r.Header.Get("X-Forwarded-For"); fwd != "" {
	// 	return strings.TrimSpace(strings.SplitN(fwd, ",", 2)[0])
	// }

	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}
