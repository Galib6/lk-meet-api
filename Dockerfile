# Use an official Node.js runtime as a parent image
FROM node:22.12.0-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy only the package.json and yarn.lock to leverage Docker cache
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
RUN yarn build

# Use a smaller base image for the final stage
FROM node:22.12.0-alpine

# Set the working directory
WORKDIR /app

# Copy the build output and dependencies from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/environments ./environments
COPY --from=builder /app/views ./views
COPY --from=builder /app/package.json ./
COPY --from=builder /app/entrypoint.sh ./

# Ensure the entrypoint script is executable
RUN chmod +x ./entrypoint.sh

# Set the environment variable
ENV PORT 6800

# Expose the port
EXPOSE $PORT

# Define the entrypoint
ENTRYPOINT ["sh", "./entrypoint.sh"]
