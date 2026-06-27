#!/bin/sh
set -e

if [ "$#" -gt 0 ]; then
  exec /docker-entrypoint.sh "$@"
fi

exec /docker-entrypoint.sh nginx -g "daemon off;"
