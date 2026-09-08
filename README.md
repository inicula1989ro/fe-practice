# mag-fe — Corner Store

React frontend for the Corner Store app — product browsing, cart, checkout,
order history, login/register, and product management. Talks to the API in
a separate repo, [mag-be](../mag-be).

## Stack

- React 19 + Vite (JS, no TypeScript)
- React Router for the store / auth / manage-products pages
- Plain CSS, no component library — ported 1:1 from the original vanilla
  frontend's `style.css`

## Setup

1. **Install dependencies**
   ```
   npm install
   ```

2. **Configure the API URL** — copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
   The default (`http://localhost:3000`) matches mag-be's local dev port,
   so this usually needs no edits.

3. **Run it** (with mag-be already running separately):
   ```
   npm run dev
   ```
   Opens on `http://localhost:5173`. Make sure mag-be's `FRONTEND_ORIGIN`
   env var includes this URL, or requests will fail CORS.

## Project structure

```
src/
  main.jsx                  entry point — router + auth provider
  App.jsx                    route definitions
  api.js                    API_BASE_URL from VITE_API_URL
  context/AuthContext.jsx    token/user state, login/logout, authFetch (attaches
                             bearer token, redirects to /auth on a 401)
  components/
    ProtectedRoute.jsx        redirects to /auth if there's no session
    ProductCard.jsx           one product tile with its own quantity input
    Banner.jsx                 success/error message strip
  hooks/useBanner.js          banner state + auto-hide timer
  pages/
    AuthPage.jsx               login/register tabs
    StorePage.jsx               product grid, cart, checkout, order history
    ManageProductsPage.jsx      add-product form + editable product list
  index.css                   all styling (ported from the original app)
```

## Notes

- Cart and auth session both persist in `localStorage`, same as the
  original vanilla frontend — refreshing the page doesn't lose either.
- `authFetch` (in `AuthContext`) is the only place that attaches the bearer
  token; a `401` response anywhere clears the session and the next render
  redirects to `/auth` via `ProtectedRoute`.
- No build-time coupling to mag-be — this is a fully static app once built
  (`npm run build`), so it can be hosted anywhere that serves static files
  (Render Static Site, Netlify, Vercel, Cloudflare Pages, etc.), independent
  of how/where the API is deployed.
