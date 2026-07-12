/**
 * PM2 ecosystem for Anthiel on a VPS.
 *
 * VPS repo root: /home/batamtoday/apps/anthiel
 *
 *   cd /home/batamtoday/apps/anthiel
 *   pm2 startOrReload deploy/ecosystem.config.cjs
 *   pm2 startOrReload deploy/ecosystem.config.cjs --only anthiel-backend
 *   pm2 startOrReload deploy/ecosystem.config.cjs --only anthiel-dashboard
 *
 * Apps load secrets from apps/backend/.env and apps/dashboard/.env (gitignored).
 * Do not put secrets in this file.
 * Override path: APP_ROOT=/home/batamtoday/apps/anthiel pm2 startOrReload ...
 */
const path = require("node:path");

const APP_ROOT = process.env.APP_ROOT
  ? path.resolve(process.env.APP_ROOT)
  : path.resolve(__dirname, "..");

module.exports = {
  apps: [
    {
      name: "anthiel-backend",
      cwd: path.join(APP_ROOT, "apps/backend"),
      script: "bun",
      args: "run start",
      interpreter: "none",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      kill_timeout: 10_000,
      env: {
        NODE_ENV: "production",
        PORT: "3005",
      },
    },
    {
      name: "anthiel-dashboard",
      cwd: path.join(APP_ROOT, "apps/dashboard"),
      script: "bun",
      args: "run start",
      interpreter: "none",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      kill_timeout: 10_000,
      env: {
        NODE_ENV: "production",
        PORT: "3006",
      },
    },
  ],
};
