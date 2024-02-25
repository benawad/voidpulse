# Stage 1: Building the code
FROM node:21-alpine as builder

# Set the working directory in the container
WORKDIR /usr/src/app

# Install system dependencies required by geoip-lite and other build tools
RUN apk add --no-cache bash g++ gcc libgcc libstdc++ linux-headers make python3
ENV PYTHONUNBUFFERED=1
RUN ln -sf python3 /usr/bin/python

# Copy package.json and package-lock.json (or yarn.lock if you use yarn)
COPY package*.json ./

# Install npm dependencies, including 'geoip-lite'
RUN npm install

# Install the GeoIP database
RUN npm run-script updatedb.geoip-lite

# Copy the rest of your application's source code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Stage 2: Run the built code with only production dependencies
FROM node:21-alpine

WORKDIR /usr/src/app

# Copy built artifacts from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Copy package.json (to run the application) and any other necessary files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Expose the port your app runs on
EXPOSE 3000

# Command to run your app
CMD ["node", "dist/index.js"]
