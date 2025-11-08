
# Memo App Backend

Go backend service for the Memo App. The server exposes a small REST API for creating, listing, and managing memos.

**Important recent changes**: 
- Server-Sent Events (SSE) support has been removed. The client uses polling to keep the UI in sync.
- In-memory caching added to optimize performance and reduce database load.

## Features

- Create / delete memos
- Sent/Received listing with pagination support
- **In-memory caching** for improved performance (configurable TTL)
- TTL support (optional): `nil` => forever; when provided, must be `>= 1` day
- Simple auth: JWT (microapp token) or `X-User-Email` header for development
- Auto-cleanup of expired memos

## Quick Start

### Prerequisites

- Go 1.21 or higher
- MySQL 8.0+ (optional - can run with in-memory store)

### Run locally

```bash
cd backend
go mod download
cp .env.example .env
# Edit .env with your database credentials if using MySQL
go run .
```

Server defaults to port `8080` (use `PORT` env var to change).

## Environment Variables

- `PORT` — Server port (default `8080`)
- `DATABASE_URL` — MySQL connection string (optional; leave empty for in-memory store)
  - Format: `username:password@tcp(host:port)/database?charset=utf8mb4&parseTime=True&loc=Local`
  - Example: `root:password@tcp(localhost:3306)/memo_db?charset=utf8mb4&parseTime=True&loc=Local`
- `CACHE_TTL_MINUTES` — Cache TTL in minutes (default `5`)
- `JWKS_URL` — JWKS URL to validate JWTs (optional; if empty, auth is bypassed for development)

## Caching
### Cache Behavior

**Cached Operations:**
- Individual memo lookups by ID
- Sent memo lists (per user, per pagination params)
- Received memo lists (per user, per pagination params)

**Cache Invalidation:**
- On memo creation → invalidates sender's sent list and recipient's received list
- On memo update → invalidates specific memo and related user lists
- On memo deletion → invalidates specific memo and related user lists
- On broadcast → invalidates all users' received lists

(~x1000 improvement)

### Configuration

Adjust cache TTL via environment variable:

```bash
# Longer TTL = better hit rate, but potentially stale data
CACHE_TTL_MINUTES=10

# Shorter TTL = fresher data, but more DB queries
CACHE_TTL_MINUTES=2
```

**Recommended**: 5-10 minutes for most use cases.

## API Endpoints

All paths are under `/api`.

### `POST /api/memos`

Create a memo.

**Body (JSON):**

```json
{
  "to": "bob@example.com",
  "subject": "Hi",
  "message": "Hello",
  "isBroadcast": false,
  "ttlDays": 7
}
```

**Response**: Created memo object.

**Note**: `from` is automatically extracted from the JWT token or `X-User-Email` header.

### `GET /api/memos/sent?limit={limit}&offset={offset}`

Get paginated sent memos for the authenticated user.

**Authentication**: User email is extracted from JWT token or `X-User-Email` header.

**Query Parameters:**
- `limit` (optional) — Items per page (default: 20, max: 100)
- `offset` (optional) — Number of items to skip (default: 0)

**Response**: Array of memo objects.

### `GET /api/memos/received?limit={limit}&offset={offset}`

Get paginated received memos for the authenticated user. Includes broadcast memos.

**Authentication**: User email is extracted from JWT token or `X-User-Email` header.

**Query Parameters:**
- `limit` (optional) — Items per page (default: 20, max: 100)
- `offset` (optional) — Number of items to skip (default: 0)

**Response**: Array of memo objects.

### `PUT /api/memos/:id/status`

Update status for a memo (e.g., mark as delivered).

**Body (JSON):**

```json
{
  "status": "delivered"
}
```

**Response**: Success message.

### `DELETE /api/memos/:id`

Delete a memo by ID.

**Response**: Success message.

### `GET /health`

Basic health check.

**Response**: `{"status": "ok", "service": "memo-app"}`

## TTL Semantics

- If `ttlDays` is **not present** (nil), the memo is stored as "forever" and will not automatically expire.
- If present, it must be an integer `>= 1` (days).
- The frontend defaults an empty TTL input to 1 day.

**Auto-cleanup rules** (runs hourly):
1. Delivered messages older than 1 hour → deleted
2. Messages with custom TTL that have expired → deleted
3. Sent messages older than 24 hours with no TTL → deleted

## Authentication

- If `JWKS_URL` is set, endpoints require a valid Bearer JWT in the `Authorization` header.
- For development or when `JWKS_URL` is empty, the server accepts `X-User-Email` header to identify the caller.

**Production**: Set `JWKS_URL` to your microapp's JWKS endpoint.

**Development/Testing**: Leave `JWKS_URL` empty and use `X-User-Email` header.

## Pagination

The server supports simple limit+offset pagination via query params `limit` and `offset`.

**Defaults**: `limit=20`, `offset=0`

**Example**: Get second page of 10 items
```bash
curl "http://localhost:8080/api/memos/sent?email=user@example.com&limit=10&offset=10"
```

## Project Structure

```
backend/
├── main.go        # Server bootstrap, routing, cache initialization
├── handlers.go    # HTTP request handlers
├── db_store.go    # Database persistence with cache integration
├── cache.go       # cache manager  
├── models.go      # Data structures and types
├── auth.go        # JWT authentication middleware
├── constants.go   # Centralized constants
├── go.mod         # Go dependencies
└── .env.example   # Environment template
```

## Testing via `curl`

**Create memo (bypass auth using header):**

```bash
curl -X POST http://localhost:8080/api/memos \
  -H "Content-Type: application/json" \
  -H "X-User-Email: alice@example.com" \
  -d '{
    "to":"bob@example.com",
    "subject":"Hello",
    "message":"Hi Bob",
    "ttlDays":7
  }'
```

**Get sent memos:**

```bash
curl "http://localhost:8080/api/memos/sent?limit=20&offset=0" \
  -H "X-User-Email: alice@example.com"
```

**Get received memos:**

```bash
curl "http://localhost:8080/api/memos/received?limit=20&offset=0" \
  -H "X-User-Email: bob@example.com"
```

**Mark memo as delivered:**

```bash
curl -X PUT http://localhost:8080/api/memos/{memo-id}/status \
  -H "Content-Type: application/json" \
  -d '{"status":"delivered"}'
```

**Delete memo:**

```bash
curl -X DELETE http://localhost:8080/api/memos/{memo-id}
```

## Build for Production

```bash
# Build binary
go build -o memo-app

# Run binary
./memo-app

# With environment variables
PORT=8080 DATABASE_URL="user:pass@tcp(host:3306)/db" ./memo-app
```

## Troubleshooting

### Cache Not Working

**Symptom**: All requests hitting database, slow response times.

**Check**:
- Verify cache initialization in logs: `Cache manager initialized with in-memory cache (TTL: 5m0s)`
- Check `CACHE_TTL_MINUTES` environment variable

### High Memory Usage

**Symptom**: Backend consuming excessive memory.

**Solution**:
- Reduce `CACHE_TTL_MINUTES` to lower value (e.g., 2-3 minutes)
- Cache automatically cleans up expired items every minute

### Stale Data

**Symptom**: Users see outdated memo lists.

**Solution**:
- Reduce `CACHE_TTL_MINUTES`
- Verify cache invalidation is working (check logs for updates/deletes)
- Frontend has manual refresh buttons as fallback

## Notes for Maintainers

- **SSE removed**: SSE support was intentionally removed due to unreliable event-source connections in webview/mobile environments. Polling is more robust.
- **Cache invalidation**: All write operations (create, update, delete) automatically invalidate relevant cached data.
- **Memory management**: The cache uses TTL-based expiration and automatic cleanup to prevent unbounded growth.


