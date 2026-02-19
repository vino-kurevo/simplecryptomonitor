#!/bin/bash
set -a
source /home/appuser/project/backend/.env
set +a
exec /home/appuser/project/backend/node_modules/.bin/tsx /home/appuser/project/backend/src/workers/dispatcher.ts
