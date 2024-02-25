# Stage 1: Building the code
FROM node:21-alpine as builder

# Set working directory
WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Copy the entire monorepo
COPY . .

# Navigate to the API directory within the monorepo
WORKDIR /usr/src/app/api

# Install dependencies for the API
RUN pnpm install --frozen-lockfile

# Build the API (assuming you have a build script defined in your package.json)
RUN pnpm run build

# Navigate to the Next.js app directory within the monorepo
WORKDIR /usr/src/app/web

# Install dependencies for the Next.js app
RUN pnpm install --frozen-lockfile

# Build the Next.js application
RUN pnpm run build

# Stage 2: Run the built code
FROM node:21-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy over the built artifacts from the builder stage
COPY --from=builder /usr/src/app/api/dist ./api
COPY --from=builder /usr/src/app/web/.next ./.next
COPY --from=builder /usr/src/app/web/public ./public
COPY --from=builder /usr/src/app/web/package.json ./package.json

# Install pnpm
RUN npm install -g pnpm

# Install only production dependencies
RUN pnpm install --prod

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["pnpm", "start"]
