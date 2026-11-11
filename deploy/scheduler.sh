#!/bin/sh
# Minimal scheduler for docker-compose. In the cloud use Cloud Scheduler / Vercel Cron
# hitting the same endpoints with "Authorization: Bearer $CRON_SECRET".
set -eu
BASE="http://lb"
AUTH="Authorization: Bearer ${CRON_SECRET}"
last_scan_day=""

while true; do
  # Worker tick: drain due jobs (retries/backoff handled by the queue).
  curl -fsS -X POST -H "$AUTH" "$BASE/api/internal/jobs" >/dev/null || echo "jobs tick failed"

  # Daily expiry digest at/after 07:00 UTC (idempotent per store per day anyway).
  today="$(date -u +%F)"
  hour="$(date -u +%H)"
  if [ "$today" != "$last_scan_day" ] && [ "$hour" -ge 7 ]; then
    curl -fsS -X POST -H "$AUTH" "$BASE/api/internal/expiry-scan" && last_scan_day="$today"
  fi
  sleep 60
done
