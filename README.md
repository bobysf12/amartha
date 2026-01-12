# Employee Management System

A modern employee management application with a React + TypeScript frontend and json-server backend.

## Demo URL

[https://amartha.bybobyy.com](https://amartha.bybobyy.com)

## Prerequisites

- [Bun](https://bun.sh/) (>= 1.2.20)

## Local Development

### Backend Setup (json-server)

The backend runs two json-server instances on ports 4001 and 4002:

```bash
cd backend
bun install
# Terminal 1
bunx json-server --watch db-step1.json --port 4001
# Terminal 2
bunx json-server --watch db-step2.json --port 4002
```

### Frontend Setup (Bun + Vite)

```bash
cd frontend
bun install
bun run dev
```

The frontend will be available at `http://localhost:5173`

## Docker

Build and run the application using Docker:

```bash
docker build -t employee-management .
docker run -p 3000:3000 -p 4001:4001 -p 4002:4002 employee-management
```

Services will be available at:
- Frontend: `http://localhost:3000`
- Backend Step 1: `http://localhost:4001`
- Backend Step 2: `http://localhost:4002`

By default, the Docker build bakes in relative API paths (`/api/step1`, `/api/step2`) so the frontend can call the same host.

To override API base URLs during the image build:

```bash
docker build \
    --build-arg VITE_API_STEP1_BASE_URL=https://amartha.bybobyy.com/api/step1 \
    --build-arg VITE_API_STEP2_BASE_URL=https://amartha.bybobyy.com/api/step2 \
    -t employee-management .
```

## Environment Variables

Copy the example environment file and configure as needed:

```bash
cp frontend/.env.example frontend/.env.local
```

Available variables (see defaults in `.env.example`):
- `VITE_API_STEP1_BASE_URL` - Step 1 API endpoint (default: http://localhost:4001)
- `VITE_API_STEP2_BASE_URL` - Step 2 API endpoint (default: http://localhost:4002)

For production with nginx proxying, set them to:
- `VITE_API_STEP1_BASE_URL=https://amartha.bybobyy.com/api/step1`
- `VITE_API_STEP2_BASE_URL=https://amartha.bybobyy.com/api/step2`

## Coolify + Cloudflare Setup

1. **Coolify build args**: set `VITE_API_STEP1_BASE_URL` and `VITE_API_STEP2_BASE_URL` to the `/api/step1` and `/api/step2` URLs shown above.
2. **Coolify port exposure**: expose only port `3000` publicly; keep `4001/4002` internal.
3. **Cloudflare DNS**: point `amartha.bybobyy.com` to your Coolify server and enable proxy (orange cloud).
4. **HTTPS**: use Full (strict) in Cloudflare and ensure Coolify has a valid TLS cert.
5. **Auto deploy**: keep the GitHub webhook in Coolify enabled so pushes trigger rebuilds.

