# Use an official Node.js runtime as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package.json package-lock.json ./

# Install dependencies using the lock file
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the app
RUN npm run build

# Expose the port Vite uses
EXPOSE 3000

# Command to run the app in development mode
CMD ["npm", "run", "dev"]