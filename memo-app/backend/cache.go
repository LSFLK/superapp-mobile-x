package main

import (
	"fmt"
	"log"
	"time"

	"github.com/patrickmn/go-cache"
)

// CacheManager manages in-memory cache using go-cache
type CacheManager struct {
	cache *cache.Cache
}

// NewCacheManager creates a new cache manager with in-memory cache
func NewCacheManager(ttl time.Duration) *CacheManager {
	// Create cache with default TTL and cleanup interval of 1 minute
	c := cache.New(ttl, 1*time.Minute)
	log.Printf("Cache manager initialized with in-memory cache (TTL: %v)", ttl)
	return &CacheManager{
		cache: c,
	}
}

// GetMemo retrieves a memo from cache
func (cm *CacheManager) GetMemo(id string) (*Memo, bool) {
	key := fmt.Sprintf("memo:%s", id)
	
	if val, found := cm.cache.Get(key); found {
		if memo, ok := val.(*Memo); ok {
			return memo, true
		}
	}
	
	return nil, false
}

// SetMemo stores a memo in cache
func (cm *CacheManager) SetMemo(memo *Memo) {
	key := fmt.Sprintf("memo:%s", memo.ID)
	cm.cache.Set(key, memo, cache.DefaultExpiration)
}

// GetMemoList retrieves a cached list of memos
func (cm *CacheManager) GetMemoList(cacheKey string) ([]*Memo, bool) {
	if val, found := cm.cache.Get(cacheKey); found {
		if memos, ok := val.([]*Memo); ok {
			return memos, true
		}
	}
	
	return nil, false
}

// SetMemoList stores a list of memos in cache
func (cm *CacheManager) SetMemoList(cacheKey string, memos []*Memo) {
	cm.cache.Set(cacheKey, memos, cache.DefaultExpiration)
}

// InvalidateMemo removes a memo from cache
func (cm *CacheManager) InvalidateMemo(id string) {
	key := fmt.Sprintf("memo:%s", id)
	cm.cache.Delete(key)
}

// InvalidateUserMemos removes all cached memo lists for a user
func (cm *CacheManager) InvalidateUserMemos(userEmail string) {
	// Invalidate sent memos cache for all pages
	sentPattern := fmt.Sprintf("sent:%s:", userEmail)
	cm.deleteByPrefix(sentPattern)
	
	// Invalidate received memos cache for all pages
	receivedPattern := fmt.Sprintf("received:%s:", userEmail)
	cm.deleteByPrefix(receivedPattern)
}

// InvalidateBroadcastMemos invalidates all users' received memo caches (for broadcasts)
func (cm *CacheManager) InvalidateBroadcastMemos() {
	// Invalidate all received memo caches
	cm.deleteByPrefix("received:")
}

// deleteByPrefix removes all cache items with keys starting with the given prefix
func (cm *CacheManager) deleteByPrefix(prefix string) {
	// Get all items and filter by prefix
	items := cm.cache.Items()
	for key := range items {
		if len(key) >= len(prefix) && key[:len(prefix)] == prefix {
			cm.cache.Delete(key)
		}
	}
}
