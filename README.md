# Anthiel

Monorepo for Anthiel — Bun workspaces, Turborepo.

| App                            | Path             | Dev port |
| ------------------------------ | ---------------- | -------- |
| Backend (Elysia + Better Auth) | `apps/backend`   | `3002`   |
| Dashboard                      | `apps/dashboard` | `3001`   |
| Landing                        | `apps/landing`   | —        |
| Shared UI                      | `packages/ui`    | —        |

## Local development

```sh
bun install
bun run dev
```

Copy env examples:

```sh
cp apps/backend/.env.example apps/backend/.env
cp apps/dashboard/.env.example apps/dashboard/.env
```

Useful scripts: `bun run lint`, `bun run format`, `bun run typecheck`.

---

## Deployment (VPS)

Stack: **PM2** (processes) + **Caddy** (local reverse proxy) + **Cloudflare** (public TLS / proxy).

| Item             | Value                                          |
| ---------------- | ---------------------------------------------- |
| Repo on server   | `/home/batamtoday/apps/anthiel`                |
| Backend (PM2)    | `anthiel-backend` → `127.0.0.1:3002`           |
| Dashboard (PM2)  | `anthiel-dashboard` → `127.0.0.1:3001`         |
| On-box hostnames | `api.anthiel.local`, `dashboard.anthiel.local` |

### 1. Prerequisites

- Bun, PM2 (`npm i -g pm2`), Caddy
- Repo cloned at `/home/batamtoday/apps/anthiel`
- Cloudflare DNS (orange cloud) pointing at the VPS for public hostnames

### 2. Secrets (not in git)

Keep a real `.env` next to each app (gitignored). Bun loads them automatically:

```text
/home/batamtoday/apps/anthiel/apps/backend/.env
/home/batamtoday/apps/anthiel/apps/dashboard/.env
```

```sh
cd /home/batamtoday/apps/anthiel
cp apps/backend/.env.example apps/backend/.env
cp apps/dashboard/.env.example apps/dashboard/.env
chmod 600 apps/backend/.env apps/dashboard/.env
# edit production values in place
```

`git pull` will not overwrite these as long as they stay untracked.

**On-box** (Caddy + `/etc/hosts`):

```env
# backend.env
BETTER_AUTH_URL=http://api.anthiel.local
PORT=3002

# dashboard.env
VITE_BETTER_AUTH_URL=http://api.anthiel.local
```

CORS origins live in `apps/backend/src/constants.ts` (`CORS_ORIGINS`).

**Production (browsers via Cloudflare)** — set public HTTPS auth URL and add the dashboard origin to `CORS_ORIGINS`:

```env
# backend.env
BETTER_AUTH_URL=https://api.yourdomain.com

# dashboard.env  (baked at build time — set before ./deploy/dashboard.sh)
VITE_BETTER_AUTH_URL=https://api.yourdomain.com
```

### 3. Hosts + Caddy

```sh
# /etc/hosts on the VPS
127.0.0.1 api.anthiel.local dashboard.anthiel.local
```

```sh
sudo cp /home/batamtoday/apps/anthiel/deploy/Caddyfile /etc/caddy/Caddyfile
# Uncomment/edit public hostname blocks for Cloudflare domains
sudo systemctl reload caddy
```

Cloudflare terminates TLS and proxies to the VPS (`:80`). Caddy only reverse-proxies to Bun.

### 4. PM2 (once)

```sh
cd /home/batamtoday/apps/anthiel
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup   # enable start on reboot; run the command it prints
```

### 5. Deploy

From the repo root on the server (`APP_ROOT` defaults to this clone):

```sh
cd /home/batamtoday/apps/anthiel
./deploy/backend.sh      # pull → install → migrate → pm2 reload anthiel-backend
./deploy/dashboard.sh    # pull → install → build → pm2 reload anthiel-dashboard
```

Or from a machine that has the same scripts wired:

```sh
bun run deploy:backend
bun run deploy:dashboard
```

Optional flags: `SKIP_PULL=1`, `SKIP_RESTART=1`, `SKIP_MIGRATE=1` (backend only), `BRANCH=main`.

### Deploy files

| Path                          | Role             |
| ----------------------------- | ---------------- |
| `deploy/backend.sh`           | Backend deploy   |
| `deploy/dashboard.sh`         | Dashboard deploy |
| `deploy/common.sh`            | Shared helpers   |
| `deploy/ecosystem.config.cjs` | PM2 apps         |
| `deploy/Caddyfile`            | Reverse proxy    |
