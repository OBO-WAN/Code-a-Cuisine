# Code à Cuisine

Smart Angular web application that turns the ingredients you already have into three AI-generated recipe ideas, then stores generated recipes in Firebase for a public cookbook/library.

## Stack

- Angular 22 (standalone components, strict TypeScript, SCSS)
- Firebase / Cloud Firestore for persistent recipe data
- n8n for recipe-generation automation, server-side validation, quotas, logging, and error handling
- GitHub Actions for CI

## Core requirements covered by the project structure

- Semantic HTML5 and responsive desktop/tablet/mobile layouts
- Minimum 16px normal text (14px only for small supporting copy)
- JSDoc/TSDoc on project functions and services
- All generated recipes persisted in Firestore
- n8n workflow exports versioned under `n8n/`
- Explicit JSON contracts between Angular and n8n
- Server-side input validation in n8n in addition to Angular validation
- IP quota design: 3 generations per IP/day, 12 generations system-wide/day
- Loading/error states and workflow error logging
- Recipe library with pagination and cuisine filters
- Public recipe detail pages
- Responsive implementation based on the supplied Figma design

## Quick start

```bash
git clone git@github.com:OBO-WAN/Code-a-Cuisine.git
cd Code-a-Cuisine
npm install
cp src/environments/environment.example.ts src/environments/environment.ts
npm start
```

Open `http://localhost:4200`.

## Firebase setup

1. Create a Firebase project.
2. Enable Cloud Firestore.
3. Copy the web app config into `src/environments/environment.ts`.
4. Review and deploy `firebase/firestore.rules` and `firebase/firestore.indexes.json`.
5. Keep service-account or privileged credentials out of the Angular app. n8n should own privileged writes and quota tracking.

## n8n setup

1. Import `n8n/recipe-generator.workflow.json` and `n8n/error-handler.workflow.json`.
2. Add credentials for your AI provider and Firestore/Google Cloud connection.
3. Configure the production webhook URL in Angular's environment file.
4. Keep workflow node names and descriptions intact; they document validation, quota enforcement, persistence, and error paths.

The Angular client sends the request contract defined in `docs/api-contract.md`; n8n validates it again, checks quota, generates exactly three recipes, persists them to Firestore, and returns the normalized result.

## Design

The visual implementation follows the supplied Figma file, including the olive green / cream palette, Quicksand + Ubuntu typography, responsive 375px mobile layouts, 1440px desktop content width, and the 1440px+ widescreen behavior.

## Development workflow

Use clear conventional-style commit messages and commit after each meaningful coding session, for example:

```text
feat: add ingredient input workflow
fix: enforce portion bounds
chore: update n8n workflow export
```

## Status

This repository is bootstrapped as a working foundation for the full checklist. Firebase project IDs, credentials, AI-provider credentials, deployed n8n webhook URLs, and production hosting values are intentionally left as environment-specific configuration and must not be committed.
