Use these EXACT values based on your live domains:

Netlify site  : https://schoolmanagementsystem07.netlify.app
Render backend: https://schoolmanagementsystem-pscb.onrender.com

Render env (Settings → Environment):
  ALLOWED_ORIGINS=https://schoolmanagementsystem07.netlify.app
  MONGO_URI=<your Mongo URI>
  NODE_VERSION=18

Netlify env (Site settings → Environment):
  VITE_API_URL=https://schoolmanagementsystem-pscb.onrender.com/api

After replacing files:
  git add server/server.js client/src/api/axios.js
  git commit -m "CORS delegate + axios prod baseURL (v2)"
  git push

Force fresh builds:
  - Render: Clear build cache & deploy
  - Netlify: Trigger redeploy

Preflight test:
  curl -i -X OPTIONS "https://schoolmanagementsystem-pscb.onrender.com/api/auth/login" \
    -H "Origin: https://schoolmanagementsystem07.netlify.app" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: content-type,authorization"
