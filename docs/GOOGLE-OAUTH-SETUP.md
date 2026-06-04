# Google Sign-In for RoomCraft (Supabase)

Your Supabase project: **ygaeyqdewovqgaqrgjdj**

## Step 1 — Google Cloud Console

1. Open [console.cloud.google.com](https://console.cloud.google.com/)
2. Create a project (or pick an existing one) from the top bar
3. Go to **APIs & Services → OAuth consent screen**
   - User type: **External** (for testing) or Internal if using Google Workspace
   - App name: `RoomCraft`
   - Support email: your email
   - Save through the steps (scopes can stay default)
4. Go to **APIs & Services → Credentials**
5. Click **+ Create Credentials → OAuth client ID**
6. Application type: **Web application**
7. Name: `RoomCraft Supabase`

### Authorized JavaScript origins (add these)

```
http://localhost:5173
https://ygaeyqdewovqgaqrgjdj.supabase.co
```

Add your Railway URL when you have it, e.g.:

```
https://your-app.up.railway.app
```

### Authorized redirect URIs (critical — copy exactly)

Supabase handles the OAuth callback. Use **only** this URI from Supabase:

```
https://ygaeyqdewovqgaqrgjdj.supabase.co/auth/v1/callback
```

Do **not** put `http://localhost:5173/auth/callback` here — that goes in Supabase URL config, not Google.

8. Click **Create**
9. Copy the **Client ID** and **Client secret**

## Step 2 — Paste into Supabase

1. [Supabase Dashboard](https://supabase.com/dashboard/project/ygaeyqdewovqgaqrgjdj/auth/providers)
2. **Authentication → Providers → Google**
3. Enable Google
4. Paste **Client ID** and **Client secret**
5. Save

## Step 3 — Supabase redirect URLs (your app)

**Authentication → URL Configuration**

| Field | Value |
|-------|--------|
| **Site URL** | `http://localhost:5173` (dev) or your Railway URL (prod) |
| **Redirect URLs** | `http://localhost:5173/auth/callback` |
| | `https://YOUR-RAILWAY-DOMAIN.up.railway.app/auth/callback` |

## Step 4 — Test

```bash
npm run dev
```

Open http://localhost:5173/login → **Continue with Google**

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `redirect_uri_mismatch` | Redirect URI in Google must be exactly `https://ygaeyqdewovqgaqrgjdj.supabase.co/auth/v1/callback` |
| Returns to app but no user | Add `http://localhost:5173/auth/callback` under Supabase Redirect URLs |
| Google button does nothing | Check `.env` has correct URL (no `/rest/v1/` suffix) |
| Profile missing | Run `supabase/schema.sql` in SQL Editor |
