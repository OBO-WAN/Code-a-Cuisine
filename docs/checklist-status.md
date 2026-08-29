# Checklist implementation status

This document separates repository-level implementation from deployment-specific configuration.

## Implemented in the repository

- Angular frontend project using standalone components and strict TypeScript
- semantic page structure and responsive SCSS
- 16px minimum body text; 14px only for supporting/meta text
- JSDoc/TSDoc comments on service and interaction functions
- Figma-derived design tokens and desktop/mobile layouts
- ingredient entry/removal and minimum-one-ingredient gate
- portions range 1–12, default 2
- cooking people range 1–3, default 1
- cooking-time, cuisine, and diet choices
- n8n workflow exports committed in Git
- server-side validation Code node before paid operations
- explicit 3-per-IP/day and 12-system/day quota policy and backend-only Firestore rules
- exactly-three-recipe output validation, 70% ingredient-use validation, max-three-extra-ingredients validation
- loading and error states
- public cookbook Firestore read service with 20-item page size and cuisine filter foundation
- recipe detail route including nutrition, ingredients, and chronological steps
- imprint route placeholder (legal identity details are intentionally not invented)
- GitHub Actions build workflow
- Firebase rules/index configuration
- architecture and API-contract documentation

## Requires deployment-specific configuration

These cannot safely be hard-coded in Git:

- Firebase project configuration values
- Firebase/Google Cloud privileged credential used by n8n
- production n8n webhook URL
- AI-provider credential and final provider node
- error-notification email/Slack recipient
- hosting project/site ID

## Must be completed before calling the production app finished

- Replace the n8n `Generate 3 recipes - DEV STUB` node with the chosen credential-backed AI provider.
- Replace the quota pass-through with Firestore-backed atomic counters.
- Replace the persistence pass-through with actual Firestore writes from n8n.
- Wire the Error Trigger workflow to an email or other configured notification node.
- Add cursor-based Firestore pagination UI beyond the first 20 results.
- Add heart/like persistence if required by the final design behavior.
- Enter the real legal details on the imprint page.
- Run cross-browser and responsive QA against the supplied Figma frames.
