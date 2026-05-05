package auth

import (
	"sync"
	"time"
)

const FailedAttemptWindow = 15 * time.Minute

type attemptEntry struct {
	count int
	expiresAt time.Time
}

type FailedAttempts struct {
	mu sync.Mutex
	entries map[string]*attemptEntry
}

func NewFailedAttempts() *FailedAttempts {
	fa := &FailedAttempts{entries: make(map[string]*attemptEntry)}
	go fa.periodicCleanup()
	return fa
}

func (fa *FailedAttempts) Increment(key string) int {
	fa.mu.Lock()
	defer fa.mu.Unlock()

	now := time.Now()
	entry, exists := fa.entries[key]
	if !exists || entry.expiresAt.Before(now) {
		fa.entries[key] = &attemptEntry{
			count: 1,
			expiresAt: now.Add(FailedAttemptWindow),
		}
		return 1
	}

	entry.count++
	return entry.count
}

func (fa *FailedAttempts) Count(key string) int {
	fa.mu.Lock()
	defer fa.mu.Unlock()

	entry, exists := fa.entries[key]
	if !exists || entry.expiresAt.Before(time.Now()) {
		return 0
	}

	return entry.count
}

func (fa *FailedAttempts) Reset(key string) {
	fa.mu.Lock()
	defer fa.mu.Unlock()
	delete(fa.entries, key)
}

func (fa *FailedAttempts) periodicCleanup() {
	ticker := time.NewTicker(FailedAttemptWindow)
	defer ticker.Stop()
	for range ticker.C {
		fa.mu.Lock()
		now := time.Now()
		for k, v := range fa.entries {
			if v.expiresAt.Before(now) {
				delete(fa.entries, k)
			}
		}
		fa.mu.Unlock()
	}
}
