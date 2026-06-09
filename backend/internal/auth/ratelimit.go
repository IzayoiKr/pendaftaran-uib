package auth

import (
	"fmt"
	"math"
	"net/http"
	"strconv"
	"sync"
	"time"

	"pendaftaran-uib/backend/internal/utils"
)

type tokenBucket struct {
	tokens     float64
	capacity   float64
	refillRate float64
	lastRefill time.Time
	mu         sync.Mutex
}

func (tb *tokenBucket) init(capacity, refillRate float64) {
	tb.tokens = capacity
	tb.capacity = capacity
	tb.refillRate = refillRate
	tb.lastRefill = time.Now()
}

func (tb *tokenBucket) allow() (bool, time.Duration) {
	tb.mu.Lock()
	defer tb.mu.Unlock()

	now := time.Now()
	elapsed := now.Sub(tb.lastRefill).Seconds()

	tb.tokens = math.Min(tb.capacity, tb.tokens+elapsed*tb.refillRate)
	tb.lastRefill = now

	if tb.tokens >= 1 {
		tb.tokens--
		return true, 0
	}

	retrySeconds := math.Ceil((1 - tb.tokens) / tb.refillRate)
	return false, time.Duration(retrySeconds) * time.Second
}

type RateLimiter struct {
	buckets    map[string]*tokenBucket
	mu         sync.RWMutex
	pool       sync.Pool
	capacity   float64
	refillRate float64
	window     time.Duration
}

func NewRateLimiter(max int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		buckets:    make(map[string]*tokenBucket),
		capacity:   float64(max),
		refillRate: float64(max) / window.Seconds(),
		window:     window,
	}
	rl.pool.New = func() any { return &tokenBucket{} }
	go rl.periodicCleanup()
	return rl
}

func (rl *RateLimiter) Allow(key string) (bool, time.Duration) {
	rl.mu.RLock()
	bucket, exists := rl.buckets[key]
	rl.mu.RUnlock()

	if !exists {
		candidate := rl.pool.Get().(*tokenBucket)
		candidate.init(rl.capacity, rl.refillRate)

		rl.mu.Lock()
		bucket, exists = rl.buckets[key]
		if !exists {
			bucket = candidate
			rl.buckets[key] = bucket
			candidate = nil
		}
		rl.mu.Unlock()

		if candidate != nil {
			rl.pool.Put(candidate)
		}
	}

	return bucket.allow()
}

func (rl *RateLimiter) RateLimit(next http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		allowed, retryAfter := rl.Allow(utils.RealIP(r))
		if !allowed {
			rateLimitResponse(w, retryAfter)
			return
		}
		next.ServeHTTP(w, r)
	}
}

func (rl *RateLimiter) RateLimitUser(next http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := GetClaims(r)
		if claims == nil {
			utils.WriteJSON(w, http.StatusUnauthorized, utils.ErrJSON("unauthorized"))
			return
		}
		allowed, retryAfter := rl.Allow(claims.Subject)
		if !allowed {
			rateLimitResponse(w, retryAfter)
			return
		}
		next.ServeHTTP(w, r)
	}
}

func RateLimitRefresh(ipLimiter, userLimiter *RateLimiter, next http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if allowed, retry := ipLimiter.Allow(utils.RealIP(r)); !allowed {
			rateLimitResponse(w, retry)
			return
		}

		if cookie, err := r.Cookie("refresh_token"); err == nil {
			if claims, err := ValidateToken(cookie.Value); err == nil && claims.Subject != "" {
				if allowed, retry := userLimiter.Allow(claims.Subject); !allowed {
					rateLimitResponse(w, retry)
					return
				}
			}
		}

		next.ServeHTTP(w, r)
	}
}

func rateLimitResponse(w http.ResponseWriter, retryAfter time.Duration) {
	secs := int(retryAfter.Seconds())
	w.Header().Set("Retry-After", strconv.Itoa(secs))
	utils.WriteJSON(w, http.StatusTooManyRequests, utils.ErrJSON(
		fmt.Sprintf("terlalu banyak percobaan, coba lagi dalam %d detik", secs),
	))
}

func (rl *RateLimiter) periodicCleanup() {
	ticker := time.NewTicker(rl.window)
	defer ticker.Stop()

	for range ticker.C {
		rl.mu.Lock()
		cutoff := time.Now().Add(-rl.window * 2)

		for key, bucket := range rl.buckets {
			bucket.mu.Lock()
			last := bucket.lastRefill
			bucket.mu.Unlock()

			if last.Before(cutoff) {
				delete(rl.buckets, key)
			}
		}

		rl.mu.Unlock()
	}
}
