#!/bin/bash

set -e

OLD_VERSION=`cat scripts/version.txt`
NEW_VERSION=`expr $OLD_VERSION + 1`
echo $NEW_VERSION > scripts/version.txt
git add scripts/version.txt
git commit -m "bump api/version.txt"

cd api

source .env

cd ..

IMAGE_NAME=benawad/voidpulse-api:$NEW_VERSION

docker build -t $IMAGE_NAME -f ./api/Dockerfile --platform linux/amd64 --build-arg CLOUD_MASTERMIND_LICENSE_KEY=$MASTERMIND_LICENSE_KEY  ./api

docker push $IMAGE_NAME

ssh dokpulse "docker pull $IMAGE_NAME && dokku git:from-image api $IMAGE_NAME"

