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
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

apt install docker-compose

git clone https://github.com/benawad/voidpulse.git

cd voidpulse

sed -i "s/\$DOMAIN/$DOMAIN/g" ./api/Dockerfile
sed -i "s/\$DOMAIN/$DOMAIN/g" ./Caddyfile
sed -i "s/\$DOMAIN/$DOMAIN/g" ./docker-compose.yaml
sed -i "s/\$DOMAIN/$DOMAIN/g" ./web/Dockerfile

sed -e '/# @inject-env-variables/r'<(sed 's/^/ENV /' ../.env) -e '/# @inject-env-variables/d' api/Dockerfile > Dockerfile.api.tmp

docker build -t web:latest -f ./web/Dockerfile .

docker build -t api:latest -f ./Dockerfile.api.tmp ./api

docker-compose up -d