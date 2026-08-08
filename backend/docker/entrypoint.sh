#!/bin/sh
set -e

php artisan config:clear || true
php artisan route:clear || true
php artisan storage:link || true
php artisan migrate --force || true

echo "Registered api/v1 routes:"
php artisan route:list --path=api/v1 --columns=method,uri 2>/dev/null | head -n 40 || true

exec php artisan serve --host=0.0.0.0 --port="${PORT:-10000}"
