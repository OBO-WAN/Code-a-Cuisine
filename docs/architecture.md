# Architecture

## Request path

```text
Angular
  │
  │ POST JSON
  ▼
n8n Webhook
  │
  ├─ validate/normalize request
  ├─ derive/validate requester IP
  ├─ read daily quota counters
  ├─ reject when IP >= 3 or global >= 12
  ├─ call AI provider
  ├─ validate exactly 3 recipes and recipe constraints
  ├─ persist recipes to Firestore
  ├─ atomically increment quota counters
  └─ return normalized JSON
  │
  ▼
Angular results view
  │
  └─ public cookbook reads persisted recipes from Firestore
```

## Security boundaries

- The browser never receives AI-provider keys or Firebase service-account credentials.
- Firestore public rules allow recipe reads only. Recipe writes and all quota collections are denied to browser clients.
- n8n performs validation even when Angular has already validated the same values.
- Request IP values must come from trusted reverse-proxy/webhook metadata, not from a client-supplied JSON field.
- Quota increments must be atomic to avoid concurrent requests bypassing limits.
- Store only what is required for quota enforcement. Prefer a keyed hash of the normalized IP rather than a raw IP address where the deployment permits it.

## Firestore collections

### `recipes/{recipeId}`

Contains the normalized recipe object returned to the frontend plus `createdAt`.

### Daily quota data

Use backend-only documents for per-IP and system-wide counters. Store a normalized/hash representation of IP data where appropriate and an explicit date/count/update timestamp.

## Responsive design

The supplied Figma establishes:

- mobile frames at 375px
- desktop content at 1440px
- at 1440px and above, keep the desktop content width stable and extend the page background
- touch-friendly mobile controls
- loading UI during AI generation
