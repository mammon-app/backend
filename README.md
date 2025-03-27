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
   - Add the necessary environment variables (database connection, API keys, and configurations).

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

