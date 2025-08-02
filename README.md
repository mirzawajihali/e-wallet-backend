# 🏦 E-Wallet Backend API

## 📋 Project Overview

A secure, modular, and role-based digital wallet system (similar to Bkash or Nagad) built with **Express.js**, **TypeScript**, and **MongoDB**. This system provides comprehensive financial operations with robust authentication, authorization, and transaction management.

## ✅ Functional Requirements Status

### 🔐 **Authentication & Authorization**
- ✅ JWT-based Authentication (access & refresh tokens)
- ✅ Role System: `USER`, `AGENT`, `ADMIN`
- ✅ Secure password hashing (bcrypt with 12 salt rounds)
- ✅ Passport.js integration (local & Google OAuth)

### 💰 **Core Features**
- ✅ **Automatic wallet creation** at registration (₹50 initial balance)
- ✅ **User Operations**: Add money, withdraw, send money, view history
- ✅ **Agent Operations**: Cash-in/cash-out for users
- ✅ **Admin Operations**: View all data, block/unblock wallets, promote users
- ✅ **Transaction tracking** with complete audit trail
- ✅ **Role-based route protection** on all endpoints

## 🏗️ Architecture

### **Tech Stack**
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Passport.js
- **Security**: bcrypt, role-based middleware
- **Architecture**: OOP-based modular design

### **Project Structure**
```
src/app/
├── modules/
│   ├── auth/          # Authentication & authorization
│   ├── user/          # User management & role promotion
│   ├── wallet/        # Wallet operations
│   └── transaction/   # Transaction tracking
├── middlewares/       # Security & validation
├── utils/            # Helper functions
└── routes/           # API route aggregation
```

## 🚀 API Endpoints

### **🔐 Authentication** (`/api/v1/auth`)
```
POST /login           # User login with credentials
POST /refresh-token   # Generate new access token
POST /reset-password  # Reset user password (requires auth)
POST /logout          # User logout
GET  /google          # Google OAuth login
```

### **👥 User Management** (`/api/v1/users`)
```
POST /register                    # User registration
GET  /                           # Get all users (Admin)
GET  /agents                     # Get all agents (Admin)
PATCH /:id                       # Update user profile
PATCH /promote-to-agent/:userId  # Promote user to agent (Admin)
PATCH /promote-to-admin/:userId  # Promote user to admin (Admin)
```

### **💰 Wallet Operations** (`/api/v1/wallets`)
```
# User Operations
GET  /my-wallet      # Get wallet details
POST /add-money      # Add money to wallet
POST /withdraw       # Withdraw money
POST /send-money     # Send money to another user

# Agent Operations  
POST /cash-in        # Cash-in for users
POST /cash-out       # Cash-out for users

# Admin Operations
GET  /all            # Get all wallets
PATCH /block/:walletId     # Block wallet
PATCH /unblock/:walletId   # Unblock wallet
```

### **📊 Transactions** (`/api/v1/transactions`)
```
GET /my-transactions      # User transaction history
GET /                    # All transactions (Admin)
GET /:transactionId      # Transaction details
GET /stats/overview      # Transaction statistics (Admin)
```

## 🎯 Role Management

### **User Promotion System**

#### **Promote User to Agent (Admin Only)**
```http
PATCH /api/v1/users/promote-to-agent/:userId
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

#### **Promote User to Admin (Super Admin Only)**
```http
PATCH /api/v1/users/promote-to-admin/:userId
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

### **Role Permissions**
| Role | Permissions |
|------|-------------|
| **USER** | Own wallet operations, send money, view own transactions |
| **AGENT** | All USER permissions + cash-in/cash-out for any user |
| **ADMIN** | All permissions + user management + system administration |

## 🛡️ Security Features

- **JWT Authentication** with token refresh mechanism
- **Role-based Authorization** on all endpoints
- **Password Hashing** with bcrypt (12 salt rounds)
- **Request Validation** using Zod schemas
- **Atomic Transactions** using MongoDB sessions
- **Error Handling** with global error handler

## 🔧 Quick Start

### **Environment Setup**
```env
DATABASE_URL=mongodb://localhost:27017/e-wallet
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
BCRYPT_SALT_ROUNDS=12
PORT=5000
```

### **Installation & Run**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

### **Create First Admin**
```bash
# Method 1: Database seeder (recommended)
npx ts-node src/scripts/createAdmin.ts

# Method 2: Promote existing user (requires existing admin)
PATCH /api/v1/users/promote-to-admin/:userId
```

## 📊 Database Schema

### **User Model**
```typescript
{
  name: string;
  email: string;         // Unique
  password: string;      // Hashed
  role: 'USER' | 'AGENT' | 'ADMIN';
  isActive: 'ACTIVE' | 'BLOCKED';
  isDeleted: boolean;
}
```

### **Wallet Model**
```typescript
{
  userId: ObjectId;      // Reference to User
  balance: number;       // Current balance
  isBlocked: boolean;    // Admin control
}
```

### **Transaction Model**
```typescript
{
  type: 'DEPOSIT' | 'WITHDRAW' | 'SEND_MONEY' | 'CASH_IN' | 'CASH_OUT';
  amount: number;
  fromWallet?: ObjectId;
  toWallet?: ObjectId;
  initiatedBy: ObjectId;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}
```

## 🧪 Complete API Testing Guide

### **🎯 Prerequisites**
```bash
# Start the server
npm run dev
# Server runs on: http://localhost:5000
```

### **1. User Registration**
```http
POST http://localhost:5000/api/v1/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### **2. User Login**
```http
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```
**Save the `accessToken` from response for authenticated requests**

### **3. Check My Wallet**
```http
GET http://localhost:5000/api/v1/wallets/my-wallet
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### **4. Add Money to Wallet**
```http
POST http://localhost:5000/api/v1/wallets/add-money
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "amount": 1000
}
```

### **5. Send Money to Another User**
```http
POST http://localhost:5000/api/v1/wallets/send-money
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "receiverEmail": "recipient@example.com",
  "amount": 500
}
```

### **6. Withdraw Money**
```http
POST http://localhost:5000/api/v1/wallets/withdraw
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "amount": 200
}
```

### **7. Get My Transaction History**
```http
GET http://localhost:5000/api/v1/transactions/my-transactions
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### **8. Agent Operations (Cash-In)**
```http
POST http://localhost:5000/api/v1/wallets/cash-in
Authorization: Bearer AGENT_ACCESS_TOKEN
Content-Type: application/json

{
  "userEmail": "user@example.com",
  "amount": 1000
}
```

### **9. Agent Operations (Cash-Out)**
```http
POST http://localhost:5000/api/v1/wallets/cash-out
Authorization: Bearer AGENT_ACCESS_TOKEN
Content-Type: application/json

{
  "userEmail": "user@example.com",
  "amount": 500
}
```

### **10. Admin - View All Users**
```http
GET http://localhost:5000/api/v1/users/
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

### **11. Admin - View All Wallets**
```http
GET http://localhost:5000/api/v1/wallets/all
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

### **12. Admin - View All Transactions**
```http
GET http://localhost:5000/api/v1/transactions/
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

### **13. Admin - Promote User to Agent**
```http
PATCH http://localhost:5000/api/v1/users/promote-to-agent/USER_ID
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

### **14. Admin - Block User Wallet**
```http
PATCH http://localhost:5000/api/v1/wallets/block/WALLET_ID
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

### **15. Get Transaction Statistics (Admin)**
```http
GET http://localhost:5000/api/v1/transactions/stats/overview
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

### **16. Refresh Access Token**
```http
POST http://localhost:5000/api/v1/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

## 🎉 System Benefits

- **🔒 Enterprise Security**: JWT + role-based + bcrypt
- **⚡ High Performance**: MongoDB sessions + query optimization
- **🏗️ Scalable Architecture**: OOP design + modular structure
- **💰 Financial Grade**: Atomic transactions + audit trails
- **🔄 Flexible Roles**: Easy user promotion system
- **📊 Complete Tracking**: All operations logged and trackable

## ✅ **All Minimum Requirements Completed**

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| JWT-based login with 3 roles | ✅ | Access/refresh tokens with USER, AGENT, ADMIN |
| Secure password hashing | ✅ | bcrypt with 12 salt rounds |
| Automatic wallet creation | ✅ | ৳50 initial balance on registration |
| User wallet operations | ✅ | Add money, withdraw, send money, view history |
| Agent operations | ✅ | Cash-in/cash-out services |
| Admin operations | ✅ | Full system management + role promotion |
| Transaction storage | ✅ | Complete audit trail with 5 transaction types |
| Role-based protection | ✅ | Middleware authorization on all endpoints |

🚀 **Your e-wallet backend is production-ready with industry-standard security and scalability!**
