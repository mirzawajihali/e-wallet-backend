# 🏪 Agent Promotion System - API Documentation

## ✅ **Implementation Complete!**

The admin can now promote users to agents using the new endpoint. Here's how to use it:

## 🔧 **API Endpoints Added:**

### **1. Promote User to Agent (Admin Only)**
```http
PATCH /api/v1/users/promote-to-agent/:userId
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

### **2. Get All Agents (Admin Only)**
```http
GET /api/v1/users/agents
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

## 🚀 **How to Use:**

### **Step 1: Create a Regular User**
```http
POST http://localhost:5000/api/v1/users/register
Content-Type: application/json

{
    "name": "John Smith",
    "email": "john@example.com",
    "password": "UserPass123!",
    "phone": "+8801700000001"
}
```

### **Step 2: Admin Login**
```http
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
    "email": "admin@ewallet.com",
    "password": "AdminPass123!"
}
```

### **Step 3: Get All Users (to find user ID)**
```http
GET http://localhost:5000/api/v1/users/
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

### **Step 4: Promote User to Agent**
```http
PATCH http://localhost:5000/api/v1/users/promote-to-agent/USER_ID_HERE
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

**Expected Response:**
```json
{
    "success": true,
    "statusCode": 200,
    "message": "User promoted to agent successfully",
    "data": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "name": "John Smith",
        "email": "john@example.com",
        "role": "AGENT",
        "phone": "+8801700000001",
        "isActive": "ACTIVE",
        "isDeleted": false,
        "isVarified": false,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
    }
}
```

### **Step 5: Verify Agent Creation**
```http
GET http://localhost:5000/api/v1/users/agents
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

### **Step 6: Test Agent Login**
```http
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "UserPass123!"
}
```

### **Step 7: Test Agent Operations**
```http
# Cash-in for another user
POST http://localhost:5000/api/v1/wallets/cash-in
Authorization: Bearer AGENT_ACCESS_TOKEN
Content-Type: application/json

{
    "userEmail": "someuser@example.com",
    "amount": 1000
}
```

## 🛡️ **Security Features:**

### **Validation Checks:**
- ✅ **User Exists**: Checks if user ID is valid
- ✅ **Already Agent**: Prevents promoting existing agents
- ✅ **Admin Protection**: Cannot demote admin to agent
- ✅ **Active Account**: Only promotes active users
- ✅ **Not Deleted**: Cannot promote deleted users

### **Error Responses:**
```json
// User not found
{
    "success": false,
    "message": "User not found",
    "error": { "statusCode": 404 }
}

// Already an agent
{
    "success": false,
    "message": "User is already an agent",
    "error": { "statusCode": 400 }
}

// Cannot demote admin
{
    "success": false,
    "message": "Cannot demote admin to agent",
    "error": { "statusCode": 400 }
}
```

## 🎯 **What Happens When User Becomes Agent:**

1. **Role Update**: User role changes from `USER` to `AGENT`
2. **Wallet Preserved**: Existing wallet and balance remain intact
3. **New Permissions**: User gains access to:
   - Cash-in operations for other users
   - Cash-out operations for other users
   - Agent-specific transaction history
4. **Transaction History**: All previous transactions remain accessible

## 📊 **Agent Capabilities After Promotion:**

### **Agent Operations:**
```http
# Get own wallet
GET /api/v1/wallets/my-wallet

# Cash-in for users
POST /api/v1/wallets/cash-in
{
    "userEmail": "user@example.com",
    "amount": 1000
}

# Cash-out for users
POST /api/v1/wallets/cash-out
{
    "userEmail": "user@example.com", 
    "amount": 500
}

# View transaction history
GET /api/v1/transactions/my-transactions
```

## 🔄 **Complete Workflow Example:**

```bash
# 1. Create user
curl -X POST http://localhost:5000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Agent Smith","email":"agent@example.com","password":"Pass123!"}'

# 2. Admin login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ewallet.com","password":"AdminPass123!"}'

# 3. Promote to agent (replace USER_ID and ADMIN_TOKEN)
curl -X PATCH http://localhost:5000/api/v1/users/promote-to-agent/USER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 4. Agent login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"agent@example.com","password":"Pass123!"}'

# 5. Agent performs cash-in (replace AGENT_TOKEN)
curl -X POST http://localhost:5000/api/v1/wallets/cash-in \
  -H "Authorization: Bearer AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userEmail":"user@example.com","amount":1000}'
```

## ✅ **System Benefits:**

1. **🔒 Secure**: Only admins can promote users
2. **🚀 Instant**: Users become agents immediately 
3. **💰 Preserved**: Wallet balance and history maintained
4. **🔄 Reversible**: Can be extended to demote agents back to users
5. **📊 Trackable**: All promotions are logged
6. **🛡️ Validated**: Multiple security checks prevent errors

Your agent promotion system is now fully functional! 🎉
