# RoomCraft — Interior Design Platform

A TikTok-style platform for interior designers to showcase work, build customizable portfolio sites, and test real products in virtual room workshops.

## Features

- **Vertical feed** — Swipe through design posts
- **Real accounts** — Email/password or **Sign in with Google** (Supabase Auth)
- **Cloud data** — Profiles, categories, projects, posts, and workshops saved in Supabase
- **Style categories** — Sub-portfolios (e.g. Modern Rustic) with room projects
- **Public designer pages** — `/designer/yourusername`
- **Virtual workshop** — Place catalog products on room photos before buying

## 1. Supabase setup (required)

### Create project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Copy **Project URL** and **anon public** key from **Settings → API**

### Run database schema

1. Open **SQL Editor** in Supabase
2. Paste and run the full contents of [`supabase/schema.sql`](supabase/schema.sql)

This creates tables, row-level security, and an auto-profile trigger on signup.

### Enable Google login

1. **Authentication → Providers → Google** → Enable
2. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/):
   - OAuth client type: **Web application**
   - **Authorized redirect URIs** (add both):
     - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
     - (Supabase shows this exact URL on the Google provider page)
3. Paste Google **Client ID** and **Client secret** into Supabase Google provider → Save

### Auth redirect URLs

**Authentication → URL Configuration**:

| Setting | Value |
|--------|--------|
| Site URL | Your production URL (e.g. `https://your-app.up.railway.app`) |
| Redirect URLs | `http://localhost:5173/auth/callback` |
| | `https://your-app.up.railway.app/auth/callback` |

For local dev, Site URL can be `http://localhost:5173`.

### Optional: disable email confirmation (faster dev)

**Authentication → Providers → Email** → turn off **Confirm email** if you want instant login after signup during development.

## 2. Environment variables

```bash
cp .env.example .env
```

Edit `.env` (use your project URL **without** `/rest/v1/`):

```env
VITE_SUPABASE_URL=https://ygaeyqdewovqgaqrgjdj.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_from_supabase_settings_api
```

**Google OAuth:** see [docs/GOOGLE-OAUTH-SETUP.md](docs/GOOGLE-OAUTH-SETUP.md)

## 3. Run locally

```bash
npm install
npm run dev
```

Open **http://localhost:5173** (not the Supabase URL) → **Join** or **Continue with Google**.

### "Connection Failed" / ERR_CONNECTION_REFUSED

| Cause | Fix |
|-------|-----|
| Dev server not running | Run `npm run dev` in the project folder, then open **http://localhost:5173** |
| Opened Supabase URL in browser | Supabase is the API backend only — use **localhost:5173** or your **Railway** app URL |
| Railway app down | Check Railway **Deploy Logs**; ensure Variables are set and redeploy |

Production preview locally:

```bash
npm run build
npm start
# open http://localhost:3000
```

## 4. Deploy to Railway

In Railway → your service → **Variables**, add (required at **build** time for Vite):

| Variable | Value |
|----------|--------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

Redeploy after adding variables. Build runs `npm install --include=dev && npm run build`, start runs `node server.mjs`.

Add your Railway domain to Supabase **Redirect URLs** (see above).

## Tech stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Supabase (Auth + Postgres)
- React Router

## Project structure

```
src/
  context/      Auth + Data (Supabase)
  lib/          supabase client, database helpers, mappers
  pages/        Feed, Profile, Workshop, Auth, etc.
supabase/
  schema.sql    Run once in Supabase SQL editor
```
