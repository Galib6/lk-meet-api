# Use a specific version of Node.js
FROM node:20

# Set the working directory
WORKDIR /app

# Copy package.json and yarn.lock files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 9000

# Start the application
CMD ["yarn", "start"]