# Code à Cuisine

Smart Angular web application that turns ingredients you already have into three AI-generated recipe ideas and publishes generated recipes to a public Firebase/Firestore cookbook.

## Stack

- Angular 22.1.x — standalone components, strict TypeScript, SCSS
- Firebase JS SDK 12.x / Cloud Firestore
- n8n — webhook automation, validation, quota enforcement, AI orchestration, persistence, logging
- GitHub Actions — build CI

## Quick start

```bash
git clone git@github.com:OBO-WAN/Code-a-Cuisine.git
cd Code-a-Cuisine
npm install
npm start
```

Open `http://localhost:4200`.

The committed `src/environments/environment.ts` contains safe placeholder values so the project can be cloned immediately. Replace those values with your Firebase web-app config and n8n webhook URL before connecting real backend data.

## Firebase

1. Create/select a Firebase project.
2. Enable Cloud Firestore.
3. Put the Firebase **web app** config in `src/environments/environment.ts`.
4. Review and deploy `firebase/firestore.rules` and `firebase/firestore.indexes.json`.
5. Keep service-account credentials out of Angular and out of Git.

The browser can read the public `recipes` collection. Privileged writes and all quota data are denied by Firestore rules and are intended to be handled by n8n/trusted backend credentials.

## n8n

Import:

- `n8n/recipe-generator.workflow.json`
- `n8n/error-handler.workflow.json`

The main workflow already contains named/documented stages for webhook intake, server-side input validation, IP/system quota gating, constrained AI prompt construction, exactly-three recipe generation, AI-output validation, Firestore persistence, and a normalized JSON response.

For safety, credentials and deployment-specific Firestore operations are **not** committed. The workflow ships with clearly marked development pass-through/stub nodes that must be replaced after you connect your Firebase and AI-provider credentials. See `docs/checklist-status.md`.

## Quota policy

- maximum **3 recipe generations per IP address per day**
- maximum **12 recipe generations system-wide per day**
- IPv4/IPv6 should be normalized
- use trusted proxy/webhook metadata for requester IP; never trust a client JSON `ip` field
- use atomic Firestore counters to prevent concurrent bypass

## Angular ↔ n8n contract

See `docs/api-contract.md`.

The contract includes ingredient names/amounts/units, 1–12 portions, 1–3 cooking people, cooking-time category, cuisine, diet, exactly three returned recipes, nutrition, missing ingredients, cook-assigned chronological directions, and remaining quota metadata.

## Design

Implementation is based on the supplied Code à Cuisine Figma design.

Core design tokens:

- olive green `#396039`
- cream `#FAF0E6`
- dark green `#10310B`
- middle green `#1E5515`
- display: Ubuntu Bold
- UI/body: Quicksand Medium/SemiBold

Responsive targets include the 375px mobile layouts, the 1440px desktop layout, and the supplied rule that content remains desktop-width while the background expands on larger screens.

## Repository map

```text
.github/workflows/       GitHub Actions
docs/                    architecture, API contract, checklist status
firebase/                Firestore rules + indexes
n8n/                     version-controlled n8n workflow exports
public/                  static public assets
src/app/core/            models and services
src/app/features/        route-level Angular features
src/app/shared/          shared UI
src/environments/        Firebase + n8n configuration
```

## Development workflow

Commit after meaningful coding sessions with clear messages, for example:

```text
feat: persist generated recipes
fix: enforce atomic quota limit
chore: export updated n8n workflow
```

## Current status

The repository is a runnable frontend foundation with the checklist architecture, Figma-derived UI, Firestore read layer, n8n workflow exports, validation contracts, and CI in place. Production credentials, the real AI-provider node, atomic quota persistence, n8n Firestore writes, notification recipient, and legal imprint details remain deployment-specific work and are tracked explicitly in `docs/checklist-status.md`.
