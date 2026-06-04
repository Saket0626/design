# RoomCraft — Interior Design Platform

A TikTok-style platform for interior designers to showcase work, build customizable portfolio sites, and test real products in virtual room workshops.

## Features

- **Vertical feed** — Swipe through design posts like TikTok
- **Designer accounts** — Bio, avatar, and selectable specialties (lighting, staging, etc.)
- **Style categories** — Sub-portfolios (e.g. Modern Rustic) with projects per room type
- **Public designer pages** — Shareable `/@username` portfolio sites
- **Virtual workshop** — Upload a room photo, drag real catalog products (LED strips, lamps, furniture), resize/rotate, and see a cost estimate before buying

## Run locally

```bash
cd /Users/saketamanana/design   # or your clone path
npm install
npm run dev
```

Open the URL in the terminal (usually **http://localhost:5173**).

Production build preview (optional):

```bash
npm run build
npm start
```

Then open **http://localhost:3000**.

## Deploy to GitHub

1. Create an empty repo on GitHub (e.g. `roomcraft`) — **do not** add a README if you already have one locally.

2. From this folder:

```bash
git init
git add .
git commit -m "Initial commit: RoomCraft interior design platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/roomcraft.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `roomcraft` with your GitHub user and repo name.

## Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign in (GitHub login works well).
2. **New Project** → **Deploy from GitHub repo** → select your `roomcraft` repo.
3. Railway auto-detects Node.js. It will run:
   - **Build:** `npm run build`
   - **Start:** `npm start` (serves the Vite `dist` folder with SPA routing)
4. Open **Settings** → **Networking** → **Generate Domain** to get a public URL.

No environment variables are required for this demo (data lives in the browser via localStorage).

If the build fails, set **Settings → Build** custom build command to `npm run build` and **Deploy** start command to `npm start`.

## Demo account

- Email: `maya@example.com`
- Password: `demo123`

## Tech stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router
- LocalStorage for persistence (no backend required for demo)

## Project structure

```
src/
  components/   Layout, FeedCard
  context/      Auth, Data
  lib/          storage, products catalog, seed data
  pages/        Feed, Profile, Workshop, Explore, etc.
  types/        User, Category, Post, Workshop models
```
