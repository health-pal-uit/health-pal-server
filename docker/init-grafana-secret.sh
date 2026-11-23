#!/bin/sh
set -eu

secret=/run/healthpal-secrets/grafana-admin-password
if [ ! -s "$secret" ]; then
  umask 077
  if [ -f /existing-monitoring/.grafana-admin-password.local ]; then
    cp /existing-monitoring/.grafana-admin-password.local "$secret"
  else
    head -c 32 /dev/urandom | base64 > "$secret"
  fi
  chown 472:472 "$secret"
  chmod 400 "$secret"
fi
