#!/bin/sh
set -e

php artisan config:clear || true
php artisan storage:link || true
php artisan migrate --force || true

exec php artisan serve --host=0.0.0.0 --port="${PORT:-10000}"
