# StockPilot

A full-stack inventory and order management application built with React, TypeScript, Node.js, Express, PostgreSQL, Prisma ORM, and Docker.

## Features

- User authentication
- Product creation, listing, updating, and deletion
- Product image uploads
- Inventory and stock quantity management
- Order management
- Dashboard summaries
- REST API integration
- PostgreSQL database with Prisma migrations
- Reusable frontend components and form validation
- Dockerized application environment

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- Tailwind CSS
- React Hook Form
- Zod

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM 7
- PostgreSQL
- JWT authentication
- Multer for product image uploads

### Development and Deployment

- Docker
- Docker Compose
- Nginx
- Git

## Prerequisites

### Docker setup

- Docker Desktop
- Git

### Local development

- Node.js 22 or a compatible version
- npm
- Docker Desktop, to run PostgreSQL
- pgAdmin 4 (optional)

## Environment Configuration

Never commit actual passwords, JWT secrets, or other sensitive credentials.

### Docker environment

Create a root `.env` file beside `docker-compose.yml`.

Example:

```env
POSTGRES_DB=stockpilot
POSTGRES_USER=stockpilot_user
POSTGRES_PASSWORD=replace_with_a_local_password
JWT_SECRET=replace_with_a_long_random_secret
```

Use the actual variable names expected by `docker-compose.yml`. The backend's `DATABASE_URL` must point to the PostgreSQL service using Docker's internal hostname and port.

Example connection string:

```env
DATABASE_URL=postgresql://stockpilot_user:replace_with_a_local_password@db:5432/stockpilot?schema=public
```

**Important:** `db` is the PostgreSQL service hostname inside Docker. Do not replace it with `localhost` for the Docker backend.

If your database password contains reserved URL characters, URL-encode them in `DATABASE_URL`.

### Local development environment

When running the frontend and backend directly on your computer, use a separate `server/.env` configuration.

Example:

```env
DATABASE_URL=postgresql://stockpilot_user:replace_with_a_local_password@localhost:5433/stockpilot?schema=public
JWT_SECRET=replace_with_a_long_random_secret
PORT=3000
```

Use the same database credentials configured for the PostgreSQL container.

For the frontend, `client/.env` should contain:

```env
VITE_API_URL=/api
```

The local Vite development server must proxy `/api` and `/uploads` requests to `http://localhost:3000`. Preserve the project's existing Vite configuration and other environment variables.

**Important:** Keep the root Docker environment and `server/.env` separate. Docker uses `db:5432`; the locally running backend uses `localhost:5433`.

---

## Option 1: Run the Complete Application with Docker

Docker Compose is the recommended option for running the complete application.

### 1. Clone the repository

```bash
git clone <repository-url>
cd umpisa
```

Replace `<repository-url>` with the actual repository URL.

### 2. Configure the root environment

Create the root `.env` file and configure the PostgreSQL credentials and JWT secret.

Ensure that the backend receives a valid `DATABASE_URL` using the Docker database hostname `db` and port `5432`.

### 3. Build and start the application

```bash
docker compose up --build -d
```

This builds and starts the services defined in `docker-compose.yml`.

### 4. Check the services

```bash
docker compose ps
```

Inspect backend logs:

```bash
docker compose logs --tail=100 backend
```

Inspect frontend logs:

```bash
docker compose logs --tail=100 frontend
```

If a service fails to start, review its logs before proceeding.

### 5. Access the application

- Frontend: `http://localhost:8080`
- Health endpoint: `http://localhost:8080/api/health`

The backend may be accessible directly on `http://localhost:3000` only if its port is published in Docker Compose. Otherwise, access the API through the frontend's Nginx proxy.

### 6. Database migrations

The backend container is configured to run Prisma migrations during startup.

Verify the backend logs to ensure that migrations finish successfully and the server starts.

### 7. Stop the application

```bash
docker compose down
```

This stops and removes the containers while preserving the named PostgreSQL volume.

Avoid `docker compose down -v` unless you intentionally want to delete the database volume and its data.

---

## Option 2: Local Development with PostgreSQL in Docker

This setup runs the React frontend and Express backend directly on your computer while PostgreSQL remains inside Docker.

This is useful for development because you can edit frontend and backend code without rebuilding the complete application after every change.

### 1. Start PostgreSQL only

Make sure the PostgreSQL service in `docker-compose.yml` publishes the container port to host port `5433`:

```yaml
ports:
  - "5433:5432"
```

Keep the existing PostgreSQL image, environment variables, health check, and named volume. Add the mapping under the actual database service if it is not already present.

Start the database:

```bash
docker compose up -d db
```

Check its status:

```bash
docker compose ps
```

The PostgreSQL service should be healthy before you start the backend.

### 2. Configure the local backend

Create or update `server/.env`:

```env
DATABASE_URL=postgresql://stockpilot_user:replace_with_a_local_password@localhost:5433/stockpilot?schema=public
JWT_SECRET=replace_with_a_long_random_secret
PORT=3000
```

Use the credentials configured in the root `.env`.

The backend runs on your computer, so it connects to PostgreSQL using `localhost:5433`, not `db:5432`.

### 3. Install backend dependencies

Open a terminal at the repository root:

```bash
cd server
npm install
```

### 4. Generate Prisma Client and apply migrations

From the `server` directory:

```bash
npx prisma validate
npx prisma generate
npx prisma migrate deploy
```

These commands validate the Prisma configuration, generate the client, and apply the existing migrations to the database.

Use the project's existing `prisma.config.ts` and Prisma 7 generator configuration.

### 5. Start the backend

Still inside `server`:

```bash
npm run dev
```

The backend should listen on port `3000`.

Verify the health endpoint:

`http://localhost:3000/api/health`

Expected response:

```json
{
  "status": "ok",
  "message": "Umpisa is working"
}
```

### 6. Install frontend dependencies

Open a second terminal at the repository root:

```bash
cd client
npm install
```

Ensure `client/.env` contains:

```env
VITE_API_URL=/api
```

Confirm that `vite.config.ts` proxies both API and image requests to the local backend.

Example proxy configuration:

```ts
server: {
  proxy: {
    "/api": {
      target: "http://localhost:3000",
      changeOrigin: true,
    },
    "/uploads": {
      target: "http://localhost:3000",
      changeOrigin: true,
    },
  },
},
```

Merge these entries into the existing configuration rather than replacing unrelated settings.

### 7. Start the frontend

From the `client` directory:

```bash
npm run dev
```

Open the local URL printed by Vite, commonly:

`http://localhost:5173`

### 8. Run both applications

For this development mode, keep three services running:

1. PostgreSQL container
2. Express backend on port `3000`
3. Vite frontend on port `5173`

To stop the local frontend and backend, press `Ctrl+C` in their respective terminals.

To stop the PostgreSQL container:

```bash
docker compose stop db
```

This preserves the database volume.

---

## PostgreSQL and pgAdmin

pgAdmin is optional. It can be used to inspect tables, execute SQL, and verify stored records.

### Connect to the Docker PostgreSQL database

Register a new server in pgAdmin with these settings:

| Field                | Value                               |
| -------------------- | ----------------------------------- |
| Name                 | StockPilot Docker                   |
| Host name/address    | `localhost`                         |
| Port                 | `5433`                              |
| Maintenance database | `stockpilot`                        |
| Username             | `stockpilot_user`                   |
| Password             | Your configured PostgreSQL password |

The PostgreSQL container must publish `5433:5432` for this connection to work.

### Connection hostname reference

| Where the backend runs                                    | Database hostname |
| --------------------------------------------------------- | ----------------- |
| Inside Docker                                             | `db:5432`         |
| Directly on your computer                                 | `localhost:5433`  |
| pgAdmin on your computer, connecting to Docker PostgreSQL | `localhost:5433`  |

Do not use `localhost:5433` from inside the backend container. Within Docker, `localhost` refers to that container itself.

---

## Authentication

Open the application and use the supported login workflow.

Valid login credentials must be available through the project's supported registration or account setup process. Do not publish actual user passwords or JWT secrets in this README.

## API and Routing

The frontend communicates with the backend through REST API endpoints.

The application includes a health endpoint:

`GET /api/health`

Product, inventory, authentication, dashboard, and order routes should be tested against the implemented backend functionality.

For image uploads, verify that:

- Uploaded files are saved to the configured uploads directory.
- Express serves files through `/uploads`.
- The local Vite proxy forwards `/uploads` requests to the backend.
- The Docker frontend's Nginx configuration proxies `/uploads/` requests to the backend.
- The database's stored image paths point to files that actually exist in the relevant environment.

**Note:** Files stored inside a Docker container or its volume are not automatically available in a separate local `server/uploads` directory. If switching between environments, make sure the required image files are present in the environment you are using.

## Testing and Build Verification

Run the tests configured in each package's `package.json`.

From the relevant package directory:

```bash
npm test
```

Run the frontend and backend build scripts where available:

```bash
npm run build
```

Do not mark testing as complete until the commands have actually run and their results have been checked.

## Git Workflow

Review changes before committing:

```bash
git status
git diff
```

Stage and commit the intended changes:

```bash
git add README.md
git commit -m "Update Docker and local development instructions"
```

Verify that `.env` files, credentials, database dumps, and unnecessary generated files are excluded from Git.

## Troubleshooting

### Backend cannot connect to PostgreSQL

- Confirm the PostgreSQL container is running and healthy.
- Check the backend's `DATABASE_URL`.
- Use `db:5432` when the backend runs inside Docker.
- Use `localhost:5433` when the backend runs locally and PostgreSQL is published on port `5433`.
- Confirm the credentials match the database configuration.

### Prisma Client has not initialized

From `server`:

```bash
npx prisma generate
```

For Docker, rebuild and restart the application:

```bash
docker compose up --build -d
```

### Database migrations fail

- Verify that PostgreSQL is reachable.
- Inspect the backend logs.
- Check `prisma.config.ts` and the Prisma schema.
- Ensure the required migration files are present.

### Product images do not load

- Check the product's `imageUrl` value.
- Confirm the corresponding file exists in the active environment's uploads directory.
- Verify Express static serving and the local Vite or Docker Nginx proxy configuration.

### Port already in use

Check whether ports `5433`, `3000`, or `5173` are occupied. If you change the PostgreSQL host port, update the local backend's `DATABASE_URL` and pgAdmin connection accordingly.

