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
POST /login           # User login
POST /refresh-token   # Generate new access token
POST /reset-password  # Reset password
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
PATCH /:id/block     # Block wallet
PATCH /:id/unblock   # Unblock wallet
```

### **📊 Transactions** (`/api/v1/transactions`)
```
GET /my-transactions # User transaction history
GET /all            # All transactions (Admin)
GET /:id            # Transaction details
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

## 🧪 Testing Examples

### **1. Create User**
```http
POST /api/v1/users/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### **2. Login & Get Token**
```http
POST /api/v1/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### **3. Add Money to Wallet**
```http
POST /api/v1/wallets/add-money
Authorization: Bearer ACCESS_TOKEN
{
  "amount": 1000
}
```

### **4. Send Money**
```http
POST /api/v1/wallets/send-money
Authorization: Bearer ACCESS_TOKEN
{
  "receiverEmail": "recipient@example.com",
  "amount": 500
}
```

### **5. Promote User (Admin Only)**
```http
PATCH /api/v1/users/promote-to-agent/:userId
Authorization: Bearer ADMIN_TOKEN
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
