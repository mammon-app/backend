FROM node:21.7.3-alpine

LABEL Maintainer="Mammon App <devcharlezen@gmail.com>"
LABEL For="Mammon App."

# Set working directory
WORKDIR /usr/src/app

# Install Redis and RabbitMQ
RUN apk add --no-cache python3 make g++ redis rabbitmq-server

# Copy package.json and package-lock.json
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy all application files
COPY . .

# Expose the application port
EXPOSE 8000

# Ensure Redis and RabbitMQ are started
RUN redis-server --daemonize yes && rabbitmq-server -detached

# Build the app
RUN npm run build

# Start all services and the app
CMD ["sh", "-c", "redis-server --daemonize yes && rabbitmq-server -detached && npm run start:prod"]
