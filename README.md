# Kakashi Game

Phaser + Vite side-scrolling action game.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The production build outputs to `dist/`.

## Deploying to Vercel

Vercel can build this repo directly with:

- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

`vercel.json` is already configured for static hosting.

## Deploying to CrazyGames

1. Run `npm run build`
2. Upload the contents of `dist/` as the HTML5 game build

The Vite build uses relative asset paths so the same `dist/` output works in hosted subpaths, which is required for portals like CrazyGames.
