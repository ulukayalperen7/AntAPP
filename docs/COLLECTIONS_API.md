# Collections API

Route collections allow users to organize saved routes into groups (e.g. "Weekend Trips", "Istanbul Walks"). Every user gets an auto-created **default collection** called "Saved Routes" for quick save/unsave via the mobile shortcut endpoints.

---

## Authentication

| Scope | Requirement |
|-------|-------------|
| User API (`/api/me/…`) | Bearer token (any authenticated user) |
| Admin API (`/api/admin/…`) | Bearer token with **Admin** role |

User endpoints extract the user ID from the JWT `uid` claim — it is never passed as a parameter.

---

## Response Models

### CollectionViewModel (list item)

```json
{
  "id": "guid",
  "userId": "guid",
  "name": "string",
  "isDefault": false,
  "isPublic": true,
  "description": "string",
  "thumbnailUrl": "string",
  "routeCount": 3,
  "created": "2026-03-16T12:00:00Z"
}
```

### CollectionDetailViewModel (single collection)

```json
{
  "id": "guid",
  "userId": "guid",
  "name": "string",
  "isDefault": false,
  "isPublic": true,
  "description": "string",
  "thumbnailUrl": "string",
  "created": "2026-03-16T12:00:00Z",
  "routes": [
    {
      "routeId": "guid",
      "title": "Sunset Walk",
      "thumbnailUrl": "string",
      "savedAt": "2026-03-16T12:00:00Z"
    }
  ]
}
```

---

## User API

All endpoints require `Authorization: Bearer <token>`.

### List my collections

```
GET /api/me/collections?pageNumber=1&pageSize=10
```

**Response:** `PagedResponse<CollectionViewModel>`

---

### Create a collection

```
POST /api/me/collections
```

**Body:**

```json
{
  "name": "Weekend Trips",
  "isPublic": true,
  "description": "Relaxing weekend routes",
  "thumbnailUrl": "https://example.com/thumb.jpg"
}
```

**Response:** `Guid` — the new collection ID.

---

### Get collection detail

```
GET /api/me/collections/{id}
```

Returns the collection with its route list. Only returns collections owned by the authenticated user.

**Response:** `CollectionDetailViewModel`

---

### Update a collection

```
PUT /api/me/collections/{id}
```

**Body:**

```json
{
  "name": "Updated Name",
  "isPublic": false,
  "description": "New description",
  "thumbnailUrl": "https://example.com/new-thumb.jpg"
}
```

**Response:** `Guid` — the updated collection ID.

---

### Delete a collection

```
DELETE /api/me/collections/{id}
```

**Response:** `Guid` — the deleted collection ID.

---

### Add a route to a collection

```
POST /api/me/collections/{id}/routes
```

**Body:**

```json
{
  "routeId": "guid"
}
```

**Response:** `Guid` — the added route ID.

**Errors:** `400` if the route is already in the collection.

---

### Remove a route from a collection

```
DELETE /api/me/collections/{id}/routes/{routeId}
```

**Response:** `Guid` — the removed route ID.

---

### Save a route (mobile shortcut)

Adds a route to the user's default "Saved Routes" collection. Creates the default collection automatically on first use.

```
POST /api/me/saved-routes
```

**Body:**

```json
{
  "routeId": "guid"
}
```

**Response:** `Guid` — the default collection ID.

**Errors:** `400` if the route is already saved.

---

### Unsave a route (mobile shortcut)

Removes a route from the user's default "Saved Routes" collection.

```
DELETE /api/me/saved-routes/{routeId}
```

**Response:** `Guid` — the removed route ID.

**Errors:** `400` if the route is not saved or no default collection exists.

---

## Admin API

All endpoints require `Authorization: Bearer <token>` with **Admin** role.

Admin endpoints skip ownership checks — any collection can be viewed, edited, or deleted.

### List all collections

```
GET /api/admin/collections?pageNumber=1&pageSize=10
```

Returns collections from all users, ordered by creation date (newest first).

**Response:** `PagedResponse<CollectionViewModel>`

---

### Get collection detail

```
GET /api/admin/collections/{id}
```

**Response:** `CollectionDetailViewModel`

---

### Update a collection

```
PUT /api/admin/collections/{id}
```

**Body:**

```json
{
  "name": "Admin Override Name",
  "isPublic": false,
  "description": "Edited by admin",
  "thumbnailUrl": "https://example.com/thumb.jpg"
}
```

**Response:** `Guid`

---

### Delete a collection

```
DELETE /api/admin/collections/{id}
```

**Response:** `Guid`

---

### Add a route to a collection

```
POST /api/admin/collections/{id}/routes
```

**Body:**

```json
{
  "routeId": "guid"
}
```

**Response:** `Guid`

---

### Remove a route from a collection

```
DELETE /api/admin/collections/{id}/routes/{routeId}
```

**Response:** `Guid`

---

### List a specific user's collections

```
GET /api/admin/users/{userId}/collections?pageNumber=1&pageSize=10
```

**Response:** `PagedResponse<CollectionViewModel>`

---

## Error Responses

All errors are returned as `ApiException` with a descriptive message:

| Scenario | Message |
|----------|---------|
| Collection not found | `"Collection not found."` |
| Ownership mismatch (user API) | `"Collection not found."` |
| Route already in collection | `"Route is already in this collection."` |
| Route not in collection | `"Route is not in this collection."` |
| Route already saved (shortcut) | `"Route is already saved."` |
| Route not saved (shortcut) | `"Route is not saved."` |
| No default collection (unsave) | `"No saved routes collection found."` |
| Not authenticated | `"Authentication required."` |

> **Note:** Ownership mismatches intentionally return "Collection not found" to avoid leaking the existence of other users' collections.
