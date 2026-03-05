# Use Node 22.14.0 on Alpine Linux as a parent image
FROM node:22.14.0-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json or yarn files
COPY package*.json ./

# Install dependencies
RUN npm i

# Copy the rest of the source code
COPY . .

# Expose the port Next.js dev server runs on
EXPOSE 3000

# Start the Next.js dev server
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
