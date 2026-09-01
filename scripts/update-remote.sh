#!/usr/bin/env bash
set -Eeuo pipefail

: "${REMOTE_SSH_KEY:?Defina REMOTE_SSH_KEY com o caminho da chave SSH}"
: "${REMOTE_HOST:?Defina REMOTE_HOST com o IP ou hostname do servidor}"
REMOTE_USER="${REMOTE_USER:-ubuntu}"
REMOTE_CONTAINER="${REMOTE_CONTAINER:-fcc-missao-konquest}"
REMOTE_TMP="${REMOTE_TMP:-/tmp/missao-conquista-release.tgz}"

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARCHIVE="$(mktemp /tmp/missao-conquista-release.XXXXXX.tgz)"
cleanup() { rm -f "$ARCHIVE"; }
trap cleanup EXIT

if [[ ! -f "$PROJECT_DIR/dist/index.js" || ! -d "$PROJECT_DIR/dist/public" ]]; then
  echo "A build não existe. Execute pnpm build antes da atualização." >&2
  exit 1
fi

tar -C "$PROJECT_DIR" -czf "$ARCHIVE" dist
scp -i "$REMOTE_SSH_KEY" -o StrictHostKeyChecking=no "$ARCHIVE" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_TMP"
ssh -i "$REMOTE_SSH_KEY" -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" \
  "REMOTE_CONTAINER='$REMOTE_CONTAINER' REMOTE_TMP='$REMOTE_TMP' bash -s" <<'REMOTE_SCRIPT'
set -Eeuo pipefail
sudo docker cp "$REMOTE_TMP" "$REMOTE_CONTAINER:/tmp/missao-conquista-release.tgz"
sudo docker exec "$REMOTE_CONTAINER" sh -lc 'rm -rf /tmp/missao-conquista-release && mkdir -p /tmp/missao-conquista-release && tar -xzf /tmp/missao-conquista-release.tgz -C /tmp/missao-conquista-release && cp -a /tmp/missao-conquista-release/dist/. /app/'
sudo docker restart "$REMOTE_CONTAINER" >/dev/null
for attempt in 1 2 3 4 5 6 7 8 9 10; do
  if sudo docker inspect -f '{{.State.Running}}' "$REMOTE_CONTAINER" 2>/dev/null | grep -qx true; then
    echo "Container $REMOTE_CONTAINER reiniciado e em execução."
    exit 0
  fi
  sleep 1
done
echo "O container $REMOTE_CONTAINER não ficou em execução." >&2
exit 1
REMOTE_SCRIPT

echo "Atualização concluída com restart obrigatório de $REMOTE_CONTAINER."
