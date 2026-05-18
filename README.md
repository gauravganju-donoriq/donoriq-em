# DonorIQ EM — Environmental Monitoring Intelligence

A React + Vite dashboard for environmental monitoring (ATP trends, AI patterns, sampling plans, AATB reporting). Originally prototyped as a single-file HTML page; this is the production app version.

## Stack

- React 19
- Vite 8 (build tool)
- Recharts (charts)
- Fonts: Fraunces, Geist, JetBrains Mono (via Google Fonts)

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Production build

```bash
npm run build      # outputs to dist/
npm run preview    # serve the built bundle locally
```

## Deploying to Vercel

This project ships with `vercel.json` pre-configured for the Vite framework. Two ways to deploy:

### Option A — Vercel CLI (fastest)

```bash
npm i -g vercel
vercel             # first run links the project, deploys a preview
vercel --prod      # deploy to production
```

### Option B — Git import

1. Push this folder to a GitHub/GitLab/Bitbucket repo.
2. In the Vercel dashboard, click **Add New → Project**, import the repo.
3. Framework preset is auto-detected as **Vite**. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Click **Deploy**.

## Project structure

```
donoriq-em/
├── index.html         # HTML shell + Google Fonts
├── src/
│   ├── main.jsx       # React entry
│   ├── App.jsx        # Dashboard (tabs, charts, KPIs)
│   └── index.css      # Global styles
├── vercel.json        # Vercel framework hint + SPA rewrites
└── vite.config.js
```
