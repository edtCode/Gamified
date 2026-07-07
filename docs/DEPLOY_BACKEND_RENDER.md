Deploying the Gamified API to Render

This guide shows how to deploy the backend (apps/api) to Render using the included `render.yaml` manifest.

1. Connect your GitHub repository to Render
   - Go to https://dashboard.render.com/new
   - Choose "Web Service" and click "Connect a repository"
   - Select this repository (Gamified)

2. Render will detect the `render.yaml` manifest and show `gamified-api` as a service. Configure the following:
   - Branch: `main`
   - Root Directory: leave as `apps/api` (already set in manifest)

3. Set environment variables in Render (Dashboard → Services → gamified-api → Environment):
   - `DATABASE_URL` (required)
   - `REDIS_URL` (optional, default `redis://localhost:6379` for local dev)
   - `JWT_SECRET` (required)
   - `WEB_ORIGIN` (set to your frontend URL, e.g. `https://gamified-pw5p-pink.vercel.app`)
   - `NODE_ENV` (set to `production`)
   - `API_PORT` (optional; Render will set an internal port, your app uses `process.env.PORT` if available)

4. Deploy
   - Click "Create Service" and Render will build and deploy `apps/api`.
   - After deployment complete, copy the service URL (e.g., `https://gamified-api.onrender.com`).

5. Configure the frontend on Vercel
   - In Vercel dashboard for your project, go to Settings → Environment Variables and set:
     - `NEXT_PUBLIC_API_URL` = `https://<your-backend-host>` (e.g., `https://gamified-api.onrender.com`)
     - `NEXT_PUBLIC_SOCKET_URL` = same as above if you enable sockets
   - Re-deploy the frontend (push a commit or trigger a redeploy from Vercel)

6. Verify
   - Open your Vercel site and try `/login` and `/signup`. They should now call the deployed backend and no longer fail due to CORS or localhost unreachability.

Notes
- Render sets `PORT` environment variable automatically; `apps/api` uses `API_PORT` or fallback to 4000 — the app will work as long as `process.env.PORT` is respected. Consider updating `apps/api` to prefer `process.env.PORT` in `config.ts` if needed.
- If you prefer Railway or Fly.io, let me know and I can create their deployment files instead.
