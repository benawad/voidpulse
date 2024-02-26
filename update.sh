#!/bin/bash
set -e
git stash
git pull
git stash pop
docker build -t web:latest -f ./web/Dockerfile .
awk 'BEGIN{while((getline l < "../.env")>0) e=e "ENV " l "\n"} /# @inject-env-variables/{print e;next}1' api/Dockerfile > Dockerfile.api.tmp
docker-compose up -d