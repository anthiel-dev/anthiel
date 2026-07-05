# Anthiel landing

Marketing site for Anthiel — home, team, portfolio, and FAQ pages. Built with TanStack Start (Vite + React), statically prerendered at build time.

## Requirements

- [Bun](https://bun.sh) 1.3+

## Local development

From the monorepo root:

```bash
bun install
bun run dev --filter=landing
```

Or from this directory:

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
bun run build
```

This prerenders every route to static HTML. Deployable output lives in:

```text
apps/landing/dist/client/
```

Preview the production build locally:

```bash
bun run preview
```

## Deploy

The site is a **static export** — upload `dist/client/` to any static host. No Node server is required in production.

### Vercel (recommended)

1. Import the GitHub repo in [Vercel](https://vercel.com).
2. Set **Root Directory** to `apps/landing`.
3. Use these settings:

| Setting          | Value                               |
| ---------------- | ----------------------------------- |
| Framework Preset | Other                               |
| Install Command  | `bun install` (runs from repo root) |
| Build Command    | `bun run build`                     |
| Output Directory | `dist/client`                       |

4. Deploy. Vercel will rebuild on every push to the connected branch.

If install must run from the monorepo root explicitly:

```bash
cd ../.. && bun install && cd apps/landing && bun run build
```

### Netlify

1. Connect the repo in [Netlify](https://netlify.com).
2. **Base directory:** `apps/landing`
3. **Build command:** `bun run build`
4. **Publish directory:** `dist/client`

### Cloudflare Pages

1. Connect the repo in [Cloudflare Pages](https://pages.cloudflare.com).
2. **Root directory:** `apps/landing`
3. **Build command:** `bun run build`
4. **Build output directory:** `dist/client`

### Manual / S3 / any static host

```bash
cd apps/landing
bun run build
```

Upload the contents of `dist/client/` to your bucket or CDN. Configure the host to serve `index.html` for unknown paths (SPA fallback) — prerendered routes (`/`, `/team`, `/built`, `/faq`) are emitted as folders with `index.html`, so direct links work without extra config on most hosts.

## Routes

| Path     | Page          |
| -------- | ------------- |
| `/`      | Home          |
| `/team`  | Team          |
| `/built` | Portfolio     |
| `/faq`   | More about us |

New file-based routes under `src/routes/` are discovered automatically and prerendered when linked from existing pages.

## Assets

- Team photo: `public/team.png` (~2 MB). A tiny blur placeholder is generated at `public/team-placeholder.png`. After replacing the team image, regenerate the placeholder:

```bash
sips -z 24 42 public/team.png --out public/team-placeholder.png
```

## Scripts

| Command                   | Description                             |
| ------------------------- | --------------------------------------- |
| `bun run dev`             | Dev server on port 3000                 |
| `bun run build`           | Prerender static site to `dist/client/` |
| `bun run preview`         | Serve production build locally          |
| `bun run test`            | Run Vitest                              |
| `bun run generate-routes` | Regenerate TanStack Router route tree   |
