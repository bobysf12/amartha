#!/bin/sh
set -e

/app/backend/node_modules/.bin/json-server --watch /app/backend/db-step1.json --host 0.0.0.0 --port 4001 &
/app/backend/node_modules/.bin/json-server --watch /app/backend/db-step2.json --host 0.0.0.0 --port 4002 &

nginx -g 'daemon off;' &

wait -n
exit 1
