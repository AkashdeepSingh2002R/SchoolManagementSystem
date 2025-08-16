Deploy Patch (Render + Netlify) — schoolmanagementsystem/
=======================================================

Layout assumed:
- Frontend: schoolmanagementsystem/client  (Vite React)
- Backend:  schoolmanagementsystem/server  (Node/Express)

Included files:
- render.yaml                                   (repo root) → Render blueprint
- netlify.toml                                  (repo root) → Netlify config
- schoolmanagementsystem/client/public/_redirects → SPA routing
- .env.example                                  (repo root) → env template
- schoolmanagementsystem/server/cors.js         → CORS options
- schoolmanagementsystem/server/index.example.js → minimal Express entry
- schoolmanagementsystem/client/src/api/axios.example.js → axios base

A) Backend on Render
--------------------
1) Push repo to GitHub.
2) Render → New → Web Service → select repo.
3) Root Directory:  schoolmanagementsystem/server
   Build Command:   npm ci
   Start Command:   npm start
   Environment:     Node
4) Environment vars:
   NODE_VERSION=18
   JWT_SECRET=<long-random>
   MONGO_URI=<your-mongo-connection-string>
   ALLOWED_ORIGINS=https://<your-netlify-site>.netlify.app,https://<your-domain>
5) If using cookies:
   - Set cookies with { httpOnly: true, secure: true, sameSite: 'none' } in production.
   - axios should have withCredentials: true on the client.
6) Health: GET https://<your-render>.onrender.com/api/health → { ok: true }

B) Frontend on Netlify
----------------------
1) New site from Git → choose repo.
2) Build:
   Base directory: schoolmanagementsystem/client
   Build command:  npm run build
   Publish dir:    dist
3) Env var:
   VITE_API_URL = https://<your-render>.onrender.com/api
4) SPA routing: included _redirects file `/* /index.html 200`

C) Lockfile sync (avoid npm ci errors)
--------------------------------------
Run locally and commit the generated lockfiles:

cd schoolmanagementsystem/server
rm -f package-lock.json
npm install

cd ../client
rm -f package-lock.json
npm install

git add schoolmanagementsystem/server/package-lock.json schoolmanagementsystem/client/package-lock.json
git commit -m "Sync lockfiles for Render/Netlify"
git push

D) Common pitfalls
------------------
- Wrong Root Directory on Render → must be: schoolmanagementsystem/server
- Hard-coded API URL in client → use import.meta.env.VITE_API_URL
- Missing ALLOWED_ORIGINS → CORS blocked cookie/requests
- Cookies in prod need: secure:true, sameSite:'none', httpOnly:true
- Two lockfiles at repo root and subfolder → always build in subfolder

Replace your existing files with these as needed, then commit and push.