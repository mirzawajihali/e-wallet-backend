# 🏦 E-Wallet Backend API

## 📋 Project Overview

A secure, modular, and role-based digital wallet system (similar to Bkash or Nagad) built with **Express.js**, **TypeScript**, and **MongoDB**. This system provides comprehensive financial operations with robust authentication, authorization, and transaction management.

## 🎯 System Architecture

```
📦 E-Wallet Backend
├── 🔐 Authentication & Authorization
├── 👥 User Management (USER, AGENT, ADMIN)
├── 💰 Wallet Management
├── 📊 Transaction System
├── 🛡️ Security Middleware
└── 📝 Comprehensive Logging
```

## ✅ Completed Functional Requirements

### 🔐 **Authentication System**
- ✅ **JWT-based Authentication** with access & refresh tokens
- ✅ **Three Role System**: `USER`, `AGENT`, `ADMIN`
- ✅ **Secure Password Hashing** using bcrypt (12 salt rounds)
- ✅ **Passport.js Integration** with local & Google OAuth strategies
- ✅ **Token Refresh Mechanism** for seamless user experience

### 👥 **User Management**
- ✅ **Automatic Wallet Creation** at registration (₹50 initial balance)
- ✅ **Role-based Registration** for users and agents
- ✅ **Profile Management** with secure field validation
- ✅ **Account Blocking/Unblocking** by admins

### 💰 **User Wallet Operations**
- ✅ **Add Money (Top-up)** with transaction recording
- ✅ **Withdraw Money** with balance validation
- ✅ **Send Money** to other users via email
- ✅ **View Transaction History** with pagination & filtering
- ✅ **Wallet Balance Tracking** with real-time updates

### 🏪 **Agent Operations**
- ✅ **Cash-In Service** - Add money to any user's wallet
- ✅ **Cash-Out Service** - Withdraw money from user wallets
- ✅ **Agent-specific Transaction History**
- ✅ **Commission Tracking** capability

### 👨‍💼 **Admin Operations**
- ✅ **View All Users** with advanced filtering
- ✅ **View All Agents** and their activities
- ✅ **View All Wallets** with pagination
- ✅ **View All Transactions** across the system
- ✅ **Block/Unblock User Wallets**
- ✅ **User Account Management**

### 📊 **Transaction System**
- ✅ **Complete Transaction Recording** for all operations
- ✅ **Transaction Types**: DEPOSIT, WITHDRAW, SEND_MONEY, CASH_IN, CASH_OUT
- ✅ **Transaction Status Tracking**: PENDING, COMPLETED, FAILED
- ✅ **Atomic Database Operations** with MongoDB sessions
- ✅ **Transaction History** with detailed audit trails

### 🛡️ **Security & Authorization**
- ✅ **Role-based Route Protection** on all endpoints
- ✅ **JWT Token Validation** middleware
- ✅ **Request Validation** using Zod schemas
- ✅ **Error Handling** with global error handler
- ✅ **Password Security** with bcrypt hashing

## 🏗️ Technical Architecture

### **Object-Oriented Design Pattern**
```typescript
// Service Layer (Business Logic)
class UserService {
    async createUser(payload: Partial<IUser>) { ... }
    async getAllUsers(query: Record<string, string>) { ... }
    async updateUserProfile(userId: string, updateData: Partial<IUser>) { ... }
}

class WalletService {
    async getMyWallet(userId: string) { ... }
    async addMoney(userId: string, amount: number) { ... }
    async sendMoney(fromUserId: string, toUserEmail: string, amount: number) { ... }
}

class AuthService {
    async getNewAccessToken(refreshToken: string) { ... }
    async resetPassword(oldPassword: string, newPassword: string, decodedToken: JwtPayload) { ... }
}
```

### **Modular Folder Structure**
```
src/
├── app/
│   ├── config/
│   │   ├── env.ts                  # Environment configuration
│   │   └── passport.ts             # Passport strategies
│   ├── modules/
│   │   ├── auth/                   # Authentication module
│   │   ├── user/                   # User management module
│   │   ├── wallet/                 # Wallet operations module
│   │   └── transaction/            # Transaction tracking module
│   ├── middlewares/
│   │   ├── checkAuth.ts           # JWT authentication middleware
│   │   ├── ValidateRequest.ts     # Request validation middleware
│   │   └── GlobalErrorHandler.ts  # Global error handling
│   ├── utils/
│   │   ├── jwt.ts                 # JWT utilities
│   │   ├── sendResponse.ts        # Standardized API responses
│   │   └── QuaryBuilder.ts        # Database query builder
│   └── routes/
│       └── index.ts               # Route aggregator
├── server.ts                      # Server entry point
└── app.ts                        # Express app configuration
```

## 🚀 API Endpoints

### **🔐 Authentication Routes** (`/api/v1/auth`)
```
POST   /login              # User login with credentials
POST   /refresh-token      # Generate new access token
POST   /reset-password     # Reset user password
POST   /google             # Google OAuth login
```

### **👥 User Routes** (`/api/v1/users`)
```
POST   /register           # User registration
GET    /                   # Get all users (Admin only)
PATCH  /:id                # Update user profile
```

### **💰 Wallet Routes** (`/api/v1/wallets`)
```
# User Operations
GET    /my-wallet          # Get user's wallet details
POST   /add-money          # Add money to wallet
POST   /withdraw           # Withdraw money from wallet
POST   /send-money         # Send money to another user

# Agent Operations  
POST   /cash-in            # Cash-in service for users
POST   /cash-out           # Cash-out service for users

# Admin Operations
GET    /all                # Get all wallets
PATCH  /:id/block          # Block user wallet
PATCH  /:id/unblock        # Unblock user wallet
```

### **📊 Transaction Routes** (`/api/v1/transactions`)
```
GET    /my-transactions    # Get user's transaction history
GET    /all                # Get all transactions (Admin only)
GET    /:id                # Get specific transaction details
```

## 🛡️ Security Features

### **Authentication & Authorization**
- **JWT Access Tokens** (15 minutes expiry)
- **JWT Refresh Tokens** (7 days expiry)
- **Role-based Access Control** (USER, AGENT, ADMIN)
- **Password Hashing** with bcrypt (12 salt rounds)
- **Token Blacklisting** capability

### **Data Validation & Sanitization**
- **Zod Schema Validation** for all request payloads
- **MongoDB ObjectId Validation**
- **Email Format Validation**
- **Amount Range Validation**

### **Database Security**
- **Atomic Transactions** using MongoDB sessions
- **Data Consistency** across wallet and transaction operations
- **Soft Delete** for user accounts
- **Index Optimization** for query performance

## 💾 Database Schema

### **User Model**
```typescript
interface IUser {
    _id: ObjectId;
    name: string;
    email: string;           // Unique identifier
    password: string;        // Hashed with bcrypt
    role: 'USER' | 'AGENT' | 'ADMIN';
    phone?: string;
    address?: string;
    isActive: 'ACTIVE' | 'BLOCKED';
    isDeleted: boolean;
    auths: IAuthProvider[];  // Credentials & OAuth providers
}
```

### **Wallet Model**
```typescript
interface IWallet {
    _id: ObjectId;
    userId: ObjectId;        // Reference to User
    balance: number;         // Current wallet balance
    isBlocked: boolean;      // Admin blocking capability
    createdAt: Date;
    updatedAt: Date;
}
```

### **Transaction Model**
```typescript
interface ITransaction {
    _id: ObjectId;
    type: 'DEPOSIT' | 'WITHDRAW' | 'SEND_MONEY' | 'CASH_IN' | 'CASH_OUT';
    amount: number;
    fee?: number;
    fromWallet?: ObjectId;
    toWallet?: ObjectId;
    initiatedBy: ObjectId;   // User or Agent who initiated
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    description?: string;
    createdAt: Date;
}
```

## 🔧 Environment Setup

### **Required Environment Variables**
```env
# Database
DATABASE_URL=mongodb://localhost:27017/e-wallet

# JWT Configuration
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Security
BCRYPT_SALT_ROUNDS=12

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Server Configuration
PORT=5000
NODE_ENV=development
```

## 🚀 Getting Started

### **1. Installation**
```bash
# Clone the repository
git clone <repository-url>
cd e-wallet-backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration
```

### **2. Database Setup**
```bash
# Make sure MongoDB is running
mongod

# The application will automatically create collections
# An admin user will be created on first run
```

### **3. Run the Application**
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start

# Server runs on: http://localhost:5000
```

### **4. API Testing**
```bash
# Health check
GET http://localhost:5000/api/v1/health

# Create a user
POST http://localhost:5000/api/v1/users/register
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "USER"
}

# Login
POST http://localhost:5000/api/v1/auth/login
{
    "email": "john@example.com",
    "password": "password123"
}
```

## 📊 Business Logic

### **Wallet Creation**
- **Automatic**: Users and Agents get wallets on registration
- **Initial Balance**: ৳50 bonus for new users
- **Admin Exception**: Admin accounts don't get wallets

### **Transaction Flow**
1. **Validation**: Check user permissions and balance
2. **Database Transaction**: Begin MongoDB session
3. **Wallet Update**: Modify balances atomically
4. **Transaction Record**: Log operation details
5. **Commit/Rollback**: Complete or revert on error

### **Role Permissions**
```typescript
USER Permissions:
- Manage own wallet (add money, withdraw, send money)
- View own transaction history
- Update own profile

AGENT Permissions:
- All USER permissions
- Cash-in/Cash-out for any user
- View commission history

ADMIN Permissions:
- View all users, wallets, transactions
- Block/unblock user wallets
- Manage user accounts
- System administration
```

## 🧪 Testing Strategy

### **Unit Testing**
- Service layer method testing
- Utility function validation
- Middleware functionality verification

### **Integration Testing**
- API endpoint testing
- Database transaction validation
- Authentication flow testing

### **Security Testing**
- JWT token validation
- Role-based access control
- Input sanitization verification

## 📈 Performance Optimizations

### **Database Optimizations**
- **Indexed Fields**: email, userId in wallets, transaction types
- **Pagination**: Implemented for all list endpoints
- **Query Builder**: Optimized database queries
- **Connection Pooling**: MongoDB connection optimization

### **API Optimizations**
- **Response Caching**: Transaction history caching
- **Request Validation**: Early validation to prevent unnecessary processing
- **Error Handling**: Efficient error responses

## 🔮 Future Enhancements

### **Phase 2 Features**
- [ ] Transaction fees system
- [ ] Agent commission calculation
- [ ] Email notifications for transactions
- [ ] SMS verification for large transactions
- [ ] Transaction limits and daily caps

### **Phase 3 Features**
- [ ] Mobile money integration
- [ ] QR code payments
- [ ] Merchant payment gateway
- [ ] Analytics dashboard
- [ ] Multi-currency support

## 🤝 Contributing

### **Development Guidelines**
1. Follow TypeScript strict mode
2. Use OOP patterns for services
3. Implement proper error handling
4. Add comprehensive logging
5. Write unit tests for new features

### **Code Standards**
- **ESLint** configuration for code quality
- **Prettier** for code formatting
- **Conventional Commits** for git messages
- **JSDoc** comments for complex functions

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Project**: E-Wallet Backend API  
**Version**: 1.0.0  
**Technology Stack**: Node.js, Express.js, TypeScript, MongoDB, JWT  
**Architecture**: OOP-based Modular Design  

---

## ✅ **Requirement Compliance Summary**

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| JWT-based login system | ✅ Complete | Access & refresh tokens with role validation |
| Three roles (admin, user, agent) | ✅ Complete | Role enum with proper authorization |
| Secure password hashing | ✅ Complete | bcrypt with 12 salt rounds |
| Automatic wallet creation | ✅ Complete | MongoDB transactions ensure atomicity |
| User wallet operations | ✅ Complete | Add money, withdraw, send money, view history |
| Agent operations | ✅ Complete | Cash-in/cash-out with transaction recording |
| Admin operations | ✅ Complete | Full system management capabilities |
| Transaction storage & tracking | ✅ Complete | Comprehensive transaction model with audit trail |
| Role-based route protection | ✅ Complete | Middleware-based authorization on all endpoints |

🎉 **All minimum functional requirements have been successfully implemented!**
