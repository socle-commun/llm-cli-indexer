# Use a Node.js image as the base
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if exists) to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose any ports if your application needs to run a server (not strictly needed for tests)
# EXPOSE 3000

RUN npm install -g vitest
RUN npm ci

# Command to run tests when the container starts
CMD ["vitest"]