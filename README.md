# IOTBTECH 2026 — Backend Assignment: Products Inventory CLI → API

A three-phase Node.js/Express/TypeScript project that takes a product inventory from a
CLI-generated CSV, serves it through a layered REST API, and wraps that API in a full
middleware and error-handling pipeline.

## What this project does

- **Phase A (CLI):** Generates a `products.csv` inventory file and aggregates per-category
  totals using Node streams (`createReadStream` + `readline`) instead of loading the whole
  file into memory.
- **Phase B (API):** Serves the products through a three-layer Express API
  (routes → controllers → services) with full CRUD, a category filter, and input validation.
- **Phase C (Middleware):** Wraps the API in a request logger (Winston), an API-key guard on
  write routes, a 404 catch-all, and a global error handler — wired in a specific, deliberate
  pipeline order.

## Repo structure
mini-project/
├── package.json
├── tsconfig.json
├── scripts/
│ ├── generate.ts
│ └── aggregate.ts
├── data/
│ ├── products.csv
│ └── category-summary.csv
└── src/
├── index.ts
├── middleware/
│ ├── requestLogger.ts
│ ├── requireApiKey.ts
│ ├── notFoundHandler.ts
│ └── errorHandler.ts
├── routes/
│ └── product.routes.ts
├── controllers/
│ └── product.controller.ts
├── services/
│ └── product.service.ts
└── utils/
└── logger.ts


## How to run

### 1. Install dependencies

```bash
cd mini-project
npm install
```

### 2. Phase A — generate and aggregate the CSV

```bash
npx tsx scripts/generate.ts
npx tsx scripts/aggregate.ts
```

Override the row count with an env var:

```bash
ROWS=1000000 npx tsx scripts/generate.ts
ROWS=1000000 npx tsx scripts/aggregate.ts
```

Override the summary output path:

```bash
OUT_FILE=data/custom-summary.csv npx tsx scripts/aggregate.ts
```

### 3. Phase B + C — run the API

```bash
npm run dev
```

Server starts on `http://localhost:3000` (or `process.env.PORT` if set).

### 4. Verify with curl

```bash
curl http://localhost:3000/api/products
curl http://localhost:3000/api/products/42
curl "http://localhost:3000/api/products?category=books"

curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Keyboard","category":"electronics","price":59,"stock":200}'
# → 401, missing API key

curl -X POST http://localhost:3000/api/products \
  -H "x-api-key: secret" -H "Content-Type: application/json" \
  -d '{"name":"Keyboard","category":"electronics","price":59,"stock":200}'
# → 201

curl http://localhost:3000/nope     # → 404 via notFoundHandler
curl http://localhost:3000/boom     # → clean 500 JSON, not a stack trace
```

Check the logs:

```bash
cat logs/app.log
```

## One-line takeaway per class

- **Class 31 (Node runtime, Buffer, Streams, Bun): I learnt that Node always shows you the raw, unprocessed thing first and nothing is auto-converted for you.
- **Class 32 (Express & TypeScript): I learnt routing is not just matching the url and it's really running through a list top to bottom and stopping at the first thing that fits.
- **Class 33 (Middleware & Error Handling): realized Express never "guesses" anything and doesn't know a middleware is done unless you call next() or send a response, and it doesn't know something throws error unless it is explicitly stated with next(err)