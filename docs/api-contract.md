# Angular ↔ n8n API contract

The frontend and workflow exchange JSON only. The n8n workflow must validate every field again; Angular validation is for UX and is not a security boundary.

## `POST /webhook/code-a-cuisine/generate`

### Request

```json
{
  "ingredients": [
    {
      "name": "baby spinach",
      "quantity": 100,
      "unit": "g"
    }
  ],
  "preferences": {
    "portions": 2,
    "cookingPeople": 1,
    "timeCategory": "quick",
    "cuisine": "Italian",
    "diet": "None"
  }
}
```

Validation rules:

- `ingredients`: at least 1 item
- ingredient names: non-empty strings
- quantity: positive finite number
- units: `g | kg | ml | l | piece | tbsp | tsp`
- portions: integer from 1 through 12
- cooking people: integer from 1 through 3
- time category: `quick | medium | complex`
- cuisine: `German | Italian | Japanese | Indian | Gourmet | Fusion`
- diet: `Vegetarian | Vegan | Keto | None`

### Success response

The workflow returns exactly three different recipes.

```json
{
  "recipes": [
    {
      "id": "firestore-document-id",
      "title": "Spinach tomato pasta",
      "cuisine": "Italian",
      "diet": "None",
      "cookingTimeMinutes": 20,
      "portions": 2,
      "usedIngredientRatio": 0.8,
      "missingIngredients": ["olive oil"],
      "ingredients": [],
      "nutritionPerPortion": {
        "calories": 630,
        "proteinG": 18,
        "carbsG": 58,
        "fatG": 24
      },
      "steps": []
    }
  ],
  "quota": {
    "remainingForIp": 2,
    "remainingSystemWide": 11,
    "resetsAt": "2026-08-30T00:00:00.000Z"
  }
}
```

Additional recipe constraints:

- exactly 3 suggestions
- each suggestion uses at least 70% of supplied ingredients
- no more than 3 additional base ingredients
- directions are chronological
- parallelizable steps are marked
- each step can be assigned to one cook
- nutrition is returned per portion

### Error response

Use meaningful HTTP status codes and a stable JSON envelope.

```json
{
  "error": {
    "code": "IP_QUOTA_EXCEEDED",
    "message": "You have used today's 3 recipe generations.",
    "retryAfter": "2026-08-30T00:00:00.000Z"
  }
}
```

Recommended error codes:

- `INVALID_INPUT` → `400`
- `IP_QUOTA_EXCEEDED` → `429`
- `SYSTEM_QUOTA_EXCEEDED` → `429`
- `AI_PROVIDER_ERROR` → `502`
- `PERSISTENCE_ERROR` → `500`
- `INTERNAL_ERROR` → `500`
