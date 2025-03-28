# Mammon App Backend

## Overview

The **Mammon App Backend** is a robust financial system built on Stellar Blockchain using **NestJS**, with **MongoDB** as its database. It incorporates **RabbitMQ** for message queuing, **Redis** for caching, **AES-256-CBC** and **CryptoJS** for encryption, and **Nodemailer** for email notifications. The backend also supports **Swagger** for API documentation, **Stellar** for blockchain transactions, and **Cloudinary** for image storage.

## Technologies Used

- **NestJS** – Backend framework
- **MongoDB** – NoSQL database
- **RabbitMQ** – Message broker
- **Redis** – Caching layer
- **AES-256-CBC & CryptoJS** – Data encryption
- **Nodemailer** – Email service
- **Swagger** – API documentation
- **Stellar** – Blockchain transactions
- **Cloudinary** – Image storage

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- Node.js (latest LTS version recommended)
- MongoDB
- Redis
- RabbitMQ

### Installation Steps

1. **Clone the Repository:**
   ```sh
   git clone https://github.com/mammon-app/backend.git
   cd backend
   ```
2. **Install Dependencies:**
   ```sh
   npm install
   ```
3. **Set Up Environment Variables:**
   - Create a `.env` file in the root directory.
   - Add the necessary environment variables (database connection, API keys, and configurations). Below is the list of environment variables that should be added to your `.env` file.

### Environment Variables

- **NODE_ENV**: Set this to the environment in which the application is running (e.g., `development`, `production`).
- **PORT**: Define the port number the backend will run on.
- **APP_NAME**: The name of the application.
- **CLIENT_URL**: The URL of your client-side frontend application.
- **TELEGRAM_COMMUNITY_URL**: URL for your Telegram community.
- **X_URL**: The URL to your X (formerly Twitter) profile or application.
- **JWT_SECRET**: Secret key used for signing JWT tokens for authentication.
- **JWT_REFRESH_SECRET**: Secret key for signing JWT refresh tokens.
- **SECRET**: General-purpose secret key used for various cryptographic functions.
- **API_KEY**: The API key for interacting with third-party services or the backend API.
- **NODE_TLS_REJECT_UNAUTHORIZED**: TLS (SSL) certificate validation setting (`0` or `1`).
- **ENCRYPTION_KEY**: The key used for encrypting sensitive data, like passwords.

- **PRODUCTION_DB_URL**: The URL for your production database.
- **DEV_DB_URL**: The URL for your development database.
- **STAGING_DB_URL**: The URL for your staging database.

- **EMAIL_PASSWORD**: The password used for email authentication via SMTP.
- **EMAIL_HOST**: The email server host.
- **EMAIL_PORT**: The port number of the email server.
- **EMAIL_USERNAME**: The username for email authentication.

- **DEV_REDIS_HOST**: The host for the Redis server in the development environment.
- **DEV_REDIS_PORT**: The port number for the Redis server in the development environment.
- **DEV_REDIS_PASSWORD**: The password for Redis in the development environment.
- **DEV_REDIS_URL**: The URL for the Redis server in the development environment.
- **PRODUCTION_REDIS_HOST**: The host for the Redis server in the production environment.
- **PRODUCTION_REDIS_PORT**: The port number for Redis in the production environment.
- **PRODUCTION_REDIS_PASSWORD**: The password for Redis in the production environment.

- **DEV_RABBITMQ_URL**: The URL for RabbitMQ in the development environment.
- **DEV_RABBITMQ_NOTIFICATION**: Notification configuration for RabbitMQ in the development environment.
- **DEV_RABBITMQ_QUEUE_NAME**: The name of the RabbitMQ queue in the development environment.
- **PRODUCTION_RABBITMQ_URL**: The URL for RabbitMQ in the production environment.
- **PRODUCTION_RABBITMQ_NOTIFICATION**: Notification configuration for RabbitMQ in the production environment.
- **PRODUCTION_RABBITMQ_QUEUE_NAME**: The name of the RabbitMQ queue in the production environment.

- **SWAGGER_API_ROOT**: The root path for Swagger API documentation.
- **SWAGGER_API_NAME**: The name of the API in the Swagger documentation.
- **SWAGGER_API_DESCRIPTION**: Description of the API in Swagger.
- **SWAGGER_API_CURRENT_VERSION**: The current version of the API.

- **STELLAR_NETWORK**: The Stellar network to use (typically `public` or `test`).
- **PRIVATE_KEY**: The private key for Stellar transactions.
- **STELLAR_ADMIN_DESTINATION_ADDRESS**: The Stellar destination address for transactions.
- **AUTH_DURATION**: The duration for which authentication tokens are valid.
- **HOME_DOMAIN**: The home domain for Stellar network operations.
- **HOME_DOMAIN_SHORT**: A short version of your home domain.
- **WEB_AUTH_ENDPOINT**: The endpoint for web authentication.
- **ASSET_CODE**: The asset code for transactions on the Stellar network.
- **SECRET_KEY**: The secret key used for authentication and transactions.
- **AUTH_KEY**: Key for authenticating Stellar services.
- **NGNC_ISSUER**: Issuer of the NGNC asset on the Stellar network.
- **STELLAR_PUBLIC_SERVER**: The URL for the public Stellar server.
- **STELLAR_TESTNET_SERVER**: The URL for the Stellar testnet server.
- **TIMEOUT**: The timeout duration for API calls or transactions.
- **FEE**: The transaction fee for Stellar operations.
- **HORIZON_MAINNET_URL**: The Horizon API URL for the Stellar mainnet.
- **HORIZON_TESTNET_URL**: The Horizon API URL for the Stellar testnet.
- **FUNDING_KEY_PUBLIC**: The public key for the funding account.
- **FUNDING_KEY_SECRET**: The secret key for the funding account.
- **FUNDING_TESTNET_KEY_SECRET**: The secret key for the funding account on the testnet.

4. **Start Required Services:**

   ```sh
   redis-server
   rabbitmq-server
   ```

5. **Run the Application:**
   ```sh
   npm run start:dev
   ```

## API Documentation

Swagger documentation is available at:

```
http://localhost:{PORT}/api/mammonapp/docs
```

Replace `{PORT}` with the actual port number defined in your `.env` file.

## Features & Endpoints

### 1. **User Authentication & Account Management**

- **Register a new user**
- **Login with credentials**
- **Password encryption using AES-256-CBC**
- **JWT-based authentication**

### 2. **Wallet Management**

- **Create a Stellar-based wallet**
- **Generate & manage wallet keys securely**
- **View wallet balance**

### 3. **Deposit & Withdraw Funds**

- **Deposit funds into the wallet**
- **Withdraw funds from the wallet to a bank or external wallet**
- **Transaction fee calculations**

### 4. **Transaction History**

- **Retrieve transaction logs**
- **Filter transactions based on date, type, and status**

### 5. **Fiat & Crypto Transactions**

- **Convert fiat to crypto and vice versa**
- **Perform swaps between supported assets**
- **Monitor live exchange rates**

### 6. **Messaging & Notifications**

- **RabbitMQ for event-driven notifications**
- **Email alerts for transactions via Nodemailer**
- **Real-time updates with Redis caching**

### 7. **Image Storage**

- **Upload and manage images using Cloudinary**
- **Secure storage and retrieval of user profile pictures**

### 8. **Decentralized Finance (DeFi) for Cross-Border Payments**

- **Built on Stellar Network for efficient, low-cost cross-border transactions**
- **Currently supports both **Testnet** and **Public Network**, but users should keep it on **Public Network** for real transactions**
- **Designed for global remittances and decentralized finance (DeFi) applications**

## Security Measures

- **Encryption:** All sensitive data is encrypted using **AES-256-CBC**.
- **Token-based Authentication:** JWT tokens ensure secure API access.
- **Role-based Access Control:** Different user roles with permission restrictions.
- **Rate Limiting & DDOS Protection:** Prevents abuse and ensures stability.

## Contribution Guidelines

If you wish to contribute:

1. Fork the repository
2. Create a new branch (`feature-branch`)
3. Commit changes and push to your fork
4. Submit a pull request for review

## License

This project is licensed under [MIT License](LICENSE).

## Contact

For inquiries or support, contact **devcharlezen@gmail.com** or visit our official website **http://mammonapp.com**.