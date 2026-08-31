# n8n workflows

This directory is intentionally version-controlled so workflow changes are reviewed together with frontend changes.

## Files

- `recipe-generator.workflow.json` — main webhook workflow scaffold
- `error-handler.workflow.json` — Error Trigger workflow

## Import and configure

1. Import both JSON files into n8n.
2. Replace the AI provider placeholder with your chosen credential-backed AI node or HTTP Request credential.
3. Connect a Google Cloud / Firebase credential to the Firestore persistence and quota operations.
4. Keep the validation and ingredient-sufficiency nodes before all paid/provider operations.
5. Enforce `3 requests / IP / day` and `12 requests / system / day` before the AI call.
6. Use a transaction/atomic operation for quota increments.
7. Configure the error workflow with your notification recipient.
8. Export changed workflows back into this directory after editing them in n8n.

## Insufficient ingredient quantities

The recipe workflow now has an explicit pre-AI branch for obviously insufficient quantities. During development it converts the supported units to a coarse food-volume equivalent and requires at least `150` equivalent units per requested portion. This is intentionally a deterministic placeholder, not ingredient-aware nutrition logic.

When the guard fails, n8n responds with HTTP `422` and this public contract:

```json
{
  "code": "INSUFFICIENT_QUANTITY",
  "message": "Some ingredient quantities are not sufficient for the selected servings.",
  "details": {
    "suppliedEquivalent": 100,
    "requiredEquivalent": 300
  }
}
```

The Angular loading screen maps that code to the approved Figma popup and routes the user back to the ingredient editor. Replace the development heuristic with ingredient-aware logic when the real AI/provider layer is connected, while keeping the same public `422` response contract.

The JSON scaffold contains meaningful node names, notes, validation code, and the response contract. Firestore credential IDs and notification recipients are deliberately not committed.
