# Stage 1: Building the code
FROM node:21-alpine as builder

# Set working directory
WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Copy the entire monorepo
COPY . .

# Navigate to the Next.js app directory within the monorepo
WORKDIR /usr/src/app/web

# Install dependencies for the Next.js app
RUN pnpm install --frozen-lockfile

ENV NEXT_PUBLIC_API_URL=https://$DOMAIN

# Build the Next.js application
RUN pnpm run build

# Stage 2: Run the built code
FROM node:21-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy over the built artifacts from the builder stage
COPY --from=builder /usr/src/app/api/package.json ./api/package.json
COPY --from=builder /usr/src/app/web/.next ./web/.next
COPY --from=builder /usr/src/app/web/public ./web/public
COPY --from=builder /usr/src/app/web/package.json ./web/package.json
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /usr/src/app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Navigate to the Next.js app directory within the monorepo
WORKDIR /usr/src/app/web

# Install pnpm
RUN npm install -g pnpm

# Install only production dependencies
RUN pnpm install --prod

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["pnpm", "start"]
