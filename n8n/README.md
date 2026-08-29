# n8n workflows

This directory is intentionally version-controlled so workflow changes are reviewed together with frontend changes.

## Files

- `recipe-generator.workflow.json` — main webhook workflow scaffold
- `error-handler.workflow.json` — Error Trigger workflow

## Import and configure

1. Import both JSON files into n8n.
2. Replace the AI provider placeholder with your chosen credential-backed AI node or HTTP Request credential.
3. Connect a Google Cloud / Firebase credential to the Firestore persistence and quota operations.
4. Keep the validation Code node before all paid/provider operations.
5. Enforce `3 requests / IP / day` and `12 requests / system / day` before the AI call.
6. Use a transaction/atomic operation for quota increments.
7. Configure the error workflow with your notification recipient.
8. Export changed workflows back into this directory after editing them in n8n.

The JSON scaffold contains meaningful node names, notes, validation code, and the response contract. Firestore credential IDs and notification recipients are deliberately not committed.
