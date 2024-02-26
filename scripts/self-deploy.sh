#!/bin/bash

if [ ! -f ".env" ]; then
  echo "The .env file is required but was not found."
  exit 1  # Exit the script with an error status
fi

source ".env"

if [ -z "$DOMAIN" ]; then
  echo "The DOMAIN variable is not defined or is empty."
  exit 1  # Exit the script with an error status
fi

# Update and upgrade Ubuntu packages
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh ./get-docker.sh

apt install docker-compose

git clone https://github.com/benawad/voidpulse.git

cd voidpulse

sed -i "s/\$DOMAIN/$DOMAIN/g" ./api/Dockerfile
sed -i "s/\$DOMAIN/$DOMAIN/g" ./Caddyfile
sed -i "s/\$DOMAIN/$DOMAIN/g" ./docker-compose.yaml
sed -i "s/\$DOMAIN/$DOMAIN/g" ./web/Dockerfile

awk 'BEGIN{while((getline l < "../.env")>0) e=e "ENV " l "\n"} /# @inject-env-variables/{print e;next}1' api/Dockerfile > Dockerfile.api.tmp

docker build -t web:latest -f ./web/Dockerfile .

docker build -t api:latest -f ./Dockerfile.api.tmp ./api

docker-compose up -d