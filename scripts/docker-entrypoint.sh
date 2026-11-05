#!/bin/sh
# Make sure the uploads volume is writable (Easypanel / Docker mounts may be owned by root),
# then run migrations and the app as the unprivileged "node" user.
set -e
mkdir -p "$UPLOAD_DIR"
chown -R node:node "$UPLOAD_DIR"
exec su-exec node sh -c "node scripts/migrate.mjs && exec node_modules/.bin/next start"
