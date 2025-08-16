All files are inside schoolmangementsystem/ (your repo root).

1) Server (Render)
   - Root Directory: server
   - Build: npm ci
   - Start: npm start
   - Env: NODE_VERSION=18, JWT_SECRET, MONGO_URI, ALLOWED_ORIGINS

   Merge server/ENTRY-MERGE.txt into your actual server entry file (server.js / index.js / app.js).
   Ensure the route GET /api/health and the CORS/cookie middleware are present.

2) Client (Netlify)
   - Base: client
   - Build: npm run build
   - Publish: dist
   - Env: VITE_API_URL=https://<your-render>.onrender.com/api
   - SPA routing via client/public/_redirects

3) Lockfiles (avoid npm ci errors)
   cd schoolmangementsystem/server && rm -f package-lock.json && npm install
   cd ../client && rm -f package-lock.json && npm install
   git add server/package-lock.json client/package-lock.json
   git commit -m "Sync lockfiles" && git push
