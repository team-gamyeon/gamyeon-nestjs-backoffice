#!/usr/bin/env bash
set -euo pipefail

CONSUL_ADDR="${CONSUL_ADDR:-http://localhost:8500}"
CONSUL_PREFIX="${CONSUL_PREFIX:-gamyeon/backoffice}"
CONSUL_HTTP_TOKEN="${CONSUL_HTTP_TOKEN:-}"

required_keys=(
  PORT
  ADMIN_EMAIL
  ADMIN_PASSWORD_HASH
  JWT_SECRET
  JWT_EXPIRES_IN
  JWT_REFRESH_SECRET
  JWT_REFRESH_EXPIRES_IN
  ALLOW_MOCK_ADMIN
  DB_HOST
  DB_PORT
  DB_USERNAME
  DB_PASSWORD
  DB_DATABASE
  DB_SSL
  DB_SSL_REJECT_UNAUTHORIZED
  DB_SYNCHRONIZE
  DB_LOGGING
  DB_MIGRATIONS_RUN
  S3_REGION
  S3_BUCKET
  S3_ACCESS_KEY_ID
  S3_SECRET_ACCESS_KEY
  FRONTEND_URL
  CONSUL_SERVICE_NAME
  CONSUL_SERVICE_ADDRESS
)

curl_args=()
if [ -n "${CONSUL_HTTP_TOKEN}" ]; then
  curl_args+=(-H "X-Consul-Token: ${CONSUL_HTTP_TOKEN}")
fi

for key in "${required_keys[@]}"; do
  value="${!key:-}"
  if [ -z "${value}" ]; then
    echo "skip ${key}: empty"
    continue
  fi

  curl -sS "${curl_args[@]}" \
    --request PUT \
    --data "${value}" \
    "${CONSUL_ADDR}/v1/kv/${CONSUL_PREFIX}/${key}" >/dev/null

  echo "put ${CONSUL_PREFIX}/${key}"
done

echo "done"
