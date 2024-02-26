#!/bin/bash
set -e
git pull
docker build -t web:latest -f ./web/Dockerfile .
sed -e '/# @inject-env-variables/r'<(sed 's/^/ENV /' ../.env) -e '/# @inject-env-variables/d' api/Dockerfile > Dockerfile.api.tmp ; docker build -t api:latest -f ./Dockerfile.api.tmp ./api
docker-compose up -d