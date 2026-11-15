#!/usr/bin/env bash

set -Eeuo pipefail

log()     { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $*"; }
error()   { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $*" >&2; }
success() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS] $*"; }

BUILD="${1:?Build directory argument is required}"
WORKSPACE="${2:?Jenkins workspace argument is required}"

IMAGE="hrmsnap_frontend_image"
CONTAINER="hrmsnap_frontend_dev"
TEMP_CONTAINER="hrmsnap_frontend_build_test"
NETWORK_NAME="hrmsnap"

# Host Nginx will eventually proxy to this port.
# The production container itself listens on port 80.
NEW_PORT="127.0.0.1:5173:80"

ROLLBACK_TAG="rollback-$(date +%Y%m%d%H%M%S)"
ROLLBACK_IMAGE="${IMAGE}:${ROLLBACK_TAG}"

OLD_CONTAINER_EXISTS=false
OLD_PORT=""
SWAP_STARTED=false
DEPLOYMENT_SUCCESS=false

cleanup() {
  docker rm -f "$TEMP_CONTAINER" >/dev/null 2>&1 || true
}

wait_for_healthy() {
  local container="$1"
  local status=""

  for i in $(seq 1 20); do
    status="$(docker inspect \
      --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}missing{{end}}' \
      "$container" 2>/dev/null || echo missing)"

    case "$status" in
      healthy)
        success "$container is healthy."
        return 0
        ;;
      unhealthy|missing)
        error "$container health status: $status"
        docker logs --tail 40 "$container" >&2 || true
        return 1
        ;;
      starting)
        log "Waiting for $container health check ($i/20)..."
        sleep 3
        ;;
      *)
        error "Unexpected health status: $status"
        return 1
        ;;
    esac
  done

  error "$container did not become healthy in time."
  docker logs --tail 40 "$container" >&2 || true
  return 1
}

rollback() {
  error "Deployment failed. Attempting rollback..."

  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true

  if [[ "$OLD_CONTAINER_EXISTS" == true ]] &&
     docker image inspect "$ROLLBACK_IMAGE" >/dev/null 2>&1; then

    log "Restoring previous image with original port mapping: $OLD_PORT"

    docker run -d \
      --name "$CONTAINER" \
      --network "$NETWORK_NAME" \
      --restart=always \
      -p "$OLD_PORT" \
      "$ROLLBACK_IMAGE"

    success "Previous frontend container restored."
  else
    error "No previous container image available for automatic rollback."
  fi
}

on_exit() {
  local exit_code="$?"

  trap - EXIT

  cleanup

  if [[ "$DEPLOYMENT_SUCCESS" != true && "$SWAP_STARTED" == true ]]; then
    rollback || error "Automatic rollback failed. Manual recovery required."
  fi

  exit "$exit_code"
}

trap on_exit EXIT

log "Preparing build directory..."

mkdir -p "$BUILD"
cp -a "$WORKSPACE/." "$BUILD/"
rm -rf "$BUILD/.git"

docker network inspect "$NETWORK_NAME" >/dev/null 2>&1 ||
  docker network create "$NETWORK_NAME"

# Capture the ACTUAL running container image and its published port.
# This supports rollback from either the old Vite image or a later Nginx image.
if docker container inspect "$CONTAINER" >/dev/null 2>&1; then
  OLD_CONTAINER_EXISTS=true

  OLD_IMAGE_ID="$(docker inspect --format='{{.Image}}' "$CONTAINER")"

  OLD_PORT="$(docker inspect "$CONTAINER" | python3 -c '
import json, sys
container = json.load(sys.stdin)[0]
bindings = container["HostConfig"]["PortBindings"]

if not bindings:
    raise SystemExit("Previous container has no published ports")

container_port, host_bindings = next(iter(bindings.items()))
binding = host_bindings[0]

host_ip = binding.get("HostIp") or "0.0.0.0"
host_port = binding["HostPort"]
container_port = container_port.split("/")[0]

print(f"{host_ip}:{host_port}:{container_port}")
')"

  docker tag "$OLD_IMAGE_ID" "$ROLLBACK_IMAGE"

  log "Rollback image: $ROLLBACK_IMAGE"
  log "Previous port mapping: $OLD_PORT"
fi

cd "$BUILD"

log "Building production frontend..."

docker build \
  --build-arg VITE_BASE_URL=/api/v1/hrm \
  -t "$IMAGE" \
  .

log "Starting temporary validation container..."

docker rm -f "$TEMP_CONTAINER" >/dev/null 2>&1 || true

docker run -d \
  --name "$TEMP_CONTAINER" \
  --network "$NETWORK_NAME" \
  "$IMAGE"

wait_for_healthy "$TEMP_CONTAINER"

log "Replacing Jenkins-managed frontend container..."

SWAP_STARTED=true

docker rm -f "$CONTAINER" >/dev/null 2>&1 || true

docker run -d \
  --name "$CONTAINER" \
  --network "$NETWORK_NAME" \
  --restart=always \
  -p "$NEW_PORT" \
  "$IMAGE"

wait_for_healthy "$CONTAINER"

DEPLOYMENT_SUCCESS=true

success "Production frontend deployed on $NEW_PORT"
success "Rollback image retained: $ROLLBACK_IMAGE"
