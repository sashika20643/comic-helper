# Comic Helper

A small web app for two people to manage a comic from idea to storyboard.

**Planning** → **Design** (characters, mechanics, environments) → **Screenplay** → **Storyboards**

- Simple username + password login (no sign-up page; you create users from the command line)
- Everything auto-saves as you type
- Images: click, drag & drop, or paste (Ctrl/Cmd+V) to upload
- Storyboards in folders (Season 1 › Episode 1 › Board), blocks with image, action, duration and notes;
  drag the ⋮⋮ handle to reorder, ▶ Play previews the board with its timings

Stack: Next.js 16, PostgreSQL (Drizzle ORM), Tailwind. Images are stored on disk (`UPLOAD_DIR`).

---

## Run locally

```bash
cp .env.example .env               # then set SESSION_SECRET (openssl rand -base64 48)
docker compose up -d db            # or use any local Postgres and change DATABASE_URL
npm install
npm run db:migrate
npm run user:create alice somepassword
npm run dev                        # http://localhost:3000
```

## Deploy on Contabo with Easypanel

Easypanel builds the Docker image from this repo's `Dockerfile` on your server and handles Postgres,
storage, domains and HTTPS. You don't need to build anything on your own computer.

### How the Docker image works

The `Dockerfile` builds in three stages:

1. **deps**: `npm ci` installs packages
2. **build**: `next build`, then dev-only packages are removed
3. **run**: a small final image (about 200 MB). On start, `scripts/docker-entrypoint.sh` makes the
   uploads folder writable, applies database migrations, then starts the app on **port 3000** as the
   unprivileged `node` user.

### 1. Push the code to GitHub

Create a **private** repo on GitHub, then:

```bash
git add -A && git commit -m "Comic Helper"
git remote add origin git@github.com:YOUR_NAME/comic-helper.git
git push -u origin main
```

In Easypanel, connect GitHub once: **Settings → GitHub → add a token** with repo access.

### 2. Create the project and database

1. **Create project**, e.g. `comic`.
2. **+ Service → Postgres**, named `db`. Open it and copy the **Internal connection URL**. It looks like
   `postgres://postgres:xxxx@comic_db:5432/comic`.

### 3. Create the app

**+ Service → App**, named `app`.

- **Source** → GitHub: pick your repo, branch `main`. **Build** → `Dockerfile` (path `Dockerfile`).
- **Environment**:
  ```
  DATABASE_URL=<the internal connection URL from step 2>
  SESSION_SECRET=<run: openssl rand -base64 48>
  ```
- **Mounts** → Add **Volume**: name `uploads`, mount path `/app/uploads`.
  This keeps uploaded images when the app is redeployed. Without it, images are lost on every deploy.
- **Domains**: add your domain (or use the free `*.easypanel.host` one) and set the **port to 3000**.
  Easypanel gives it HTTPS automatically.
- Click **Deploy**. The first build takes a few minutes. Watch it under **Deployments**.

### 4. Create the logins (once)

Open the app service → **Console** (choose `sh`) and run:

```sh
node scripts/create-user.mjs alice somepassword
node scripts/create-user.mjs bob anotherpassword
```

Running the same command again resets that user's password.

### Updating

Push to GitHub, then click **Deploy**. You can also turn on **Auto Deploy** so every push deploys.
Database migrations run automatically on start, and your data in Postgres and the `uploads` volume is kept.

### Troubleshooting

- **Logged in but sent back to the login page**: open the site over **https**. The login cookie is
  HTTPS-only. Only for testing over plain http, add `COOKIE_SECURE=false` to Environment.
- **502 / Bad Gateway**: check that the domain port is `3000`, and read the app **Logs**.
- **Build fails with out-of-memory**: the VPS needs about 2 GB free RAM while building.

### Backups

- **Database**: in Easypanel, open the Postgres service → **Backups** and set up scheduled backups
  (to S3 or similar).
- **Images**: they are in the app's `uploads` volume. To back it up from your computer:
  `ssh root@SERVER 'docker exec $(docker ps -qf name=comic_app | head -1) tar czf - -C /app uploads' > uploads-backup.tgz`

### Reset a password

Run `node scripts/create-user.mjs alice newpassword` in the app's Console (the same command creates or
updates a user). Users can also change their own password from the account page (click your name, top right).

---

## Customising

- **Character / mechanic / environment fields** – edit `src/lib/design-config.ts`. Fields are stored as JSON,
  so adding or renaming fields needs no database migration. Image tags (Character sheet, Pose, …) live there too.
- **Database changes** – edit `src/lib/schema.ts`, then `npm run db:generate` and commit the new file in `drizzle/`.
# comic-helper
