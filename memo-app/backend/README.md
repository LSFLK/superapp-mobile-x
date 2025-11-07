
# Memo App Backend

Go backend service for the Memo App. The server exposes a small REST API for creating, listing, and managing memos.

**Important recent change**: Server-Sent Events (SSE) support has been removed. The client uses polling to keep the UI in sync.

## Features

- Create / delete memos
- Sent/Received listing with pagination support
- TTL support (optional): `nil` => forever; when provided, must be `>= 1` day
- Simple auth: JWT (microapp token) or `X-User-Email` header for development
- Auto-cleanup of expired memos

## Quick Start

### Prerequisites

- Go 1.21 or higher

### Run locally (no DB)

This repo can run without a persistent DB using the in-memory store for development. If you use MySQL, set `DATABASE_URL` accordingly.

```bash
cd backend
go mod download
cp .env.example .env
# edit .env if needed
go run .
```

Server defaults to port `8080` (use `PORT` env var to change).

## Environment variables

- `PORT`—server port (default `8080`)
- `DATABASE_URL`—optional SQL connection string; leave empty to use in-memory store
- `JWKS_URL`—optional JWKS URL to validate JWTs (if empty, auth is bypassed for development)

## API

All paths are under `/api`.

### `POST /api/memos`

Create a memo.

**Body (JSON):**

```json
{
  "from": "alice@example.com",
  "to": "bob@example.com",
  "subject": "Hi",
  "message": "Hello",
  "isBroadcast": false,
  "ttlDays": 7
}
```

**Response**: created memo object.

### `GET /api/memos/sent?email={email}&page={page}&limit={limit}`

Get paginated sent memos for user. `page` starts at 1. `limit` defaults to 20.

### `GET /api/memos/received?email={email}&page={page}&limit={limit}`

Get paginated received memos for user. Broadcast memos are included.

### `PUT /api/memos/:id/status`

Update status for a memo (e.g., mark as delivered). Body expects `{ "status": "delivered" }`.

### `DELETE /api/memos/:id`

Delete a memo by id.

### `GET /health`

Basic health check.

## TTL semantics

- If `ttlDays` is not present (nil), the memo is stored as "forever" and will not automatically expire.
- If present, it must be an integer `>= 1` (days).
- The frontend defaults an empty TTL input to 1 day.

## Authentication

- If `JWKS_URL` is set, endpoints require a valid Bearer JWT in the `Authorization` header.
- For development or when `JWKS_URL` is empty, the server will accept `X-User-Email` header to identify the caller.

## Pagination

- The server supports simple page+limit pagination via query params `page` and `limit`.
- Defaults: `page=1`, `limit=20`.
- The frontend uses `useMemos` and `MemoList` which expose a "Load more" button to fetch the next page.

## Project layout (important files)

- `main.go`—server bootstrap and route registration
- `handlers.go`—HTTP handlers for memo operations
- `models.go`—memo models and types
- `db_store.go`—persistence (in-memory or SQL)
- `auth.go`—JWT parsing / auth helpers
- `constants.go`—centralized strings and defaults

## Testing via `curl`

**Create memo (bypass auth using header):**

```bash
curl -X POST http://localhost:8080/api/memos \
  -H "Content-Type: application/json" \
  -H "X-User-Email: alice@example.com" \
  -d '{"to":"bob@example.com","subject":"Hello","message":"Hi Bob","ttlDays":7}'
```

**Get first page of received memos:**

```bash
curl "http://localhost:8080/api/memos/received?email=bob@example.com&page=1&limit=20"
```

## Notes for maintainers

- SSE support was intentionally removed due to unreliable event-source connections in the webview/mobile environment; polling is more robust here.


