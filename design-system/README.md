# Design system

React component library with design tokens. A Vite-powered gallery at `/` lists all components for manual testing.

## Requirements

- Node.js 20+ (recommended)

## Setup

```bash
git clone https://github.com/elizaburenok/design-system.git
cd design-system
npm install
```

## Scripts

- `npm run dev` — local development server
- `npm run build` — production build (output in `dist/`)
- `npm run preview` — preview the production build locally
- `npm run type-check` — TypeScript check without emitting files

## Repository layout

- `components/` — UI components
- `tokens/` — design tokens (CSS variables and TS helpers)
- `src/` — gallery app (`ComponentsGalleryPage`)

## GitHub Pages

On each push to `main`, [Deploy gallery to GitHub Pages](.github/workflows/deploy-pages.yml) builds the site and deploys it. In the repository settings, set **Pages** → **Build and deployment** → **Source** to **GitHub Actions**.

The public URL is `https://elizaburenok.github.io/design-system/`.
