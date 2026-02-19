#!/bin/bash
set -a
source /tmp/cc-agent/61105712/project/backend/.env
set +a
exec /tmp/cc-agent/61105712/project/backend/node_modules/.bin/tsx /tmp/cc-agent/61105712/project/backend/src/workers/monitoring.ts
