# Hero assets

This directory stores the permanent assets used by the approved Figma hero composition.

Expected files:

- `plate-top.png` — photographic top plate export from Figma
- `plate-middle.png` — photographic middle plate export from Figma
- `plate-bottom.png` — photographic bottom plate export from Figma
- `logo-mark.svg` — vector logo mark from Figma
- `logo-wordmark.svg` — vector wordmark from Figma
- `arrow.svg` — vector secondary-CTA arrow from Figma

The three food/plate assets remain PNG because their Figma source is raster photography. Wrapping them in SVG would not make them vector and would only add an unnecessary container around raster pixels.

Run `npm run vendor:hero-assets` once while the temporary Figma MCP URLs in `home.component.ts` are still valid. The command downloads the exact source assets into this directory and rewrites the component to local `/assets/hero/...` paths.
