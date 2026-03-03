# Use Node 24.14.0 on Alpine Linux as a parent image
FROM node:24.14.0-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the NestJS application (adjust command if needed)
RUN npm run build

# Expose the NestJS app port
EXPOSE 3000

# Run the application
CMD ["npm", "run", "start:dev"]
