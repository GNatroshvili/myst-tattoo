# Myst Tattoo - Backend

Express + MongoDB (Mongoose) API. Environment only for now; business logic comes later.

## Setup

```bash
cp .env.example .env   # adjust MONGODB_URI if needed
npm install
npm run dev            # http://localhost:5000
```

## Endpoints

- `GET /api/health` - service and database status

## Structure

```
src/
  server.js        # entry: starts HTTP server, connects to MongoDB
  app.js           # express app, middleware, route mounting
  config/db.js     # mongoose connection helpers
  routes/          # route modules (empty)
  controllers/     # request handlers (empty)
  models/          # mongoose schemas (empty)
  middleware/      # custom middleware (empty)
```
