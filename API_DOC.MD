# Admin Dashboard API Documentation

Complete API reference for the WhatsApp AI Chatbot Admin Dashboard.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication APIs](#authentication-apis)
3. [Admin User Management APIs](#admin-user-management-apis)
4. [Ticket Management APIs](#ticket-management-apis)
5. [Common Error Responses](#common-error-responses)
6. [Database Setup](#database-setup)

---

## Getting Started

### Base URL
```
http://localhost:8000
```

### Authentication
Most endpoints require JWT authentication. Include the access token in the Authorization header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Content Type
All requests and responses use JSON:
```
Content-Type: application/json
```

---

## Authentication APIs

### 1. Login

**Purpose:** Authenticate admin/agent users and obtain JWT tokens for API access.

**Why:** Initial authentication to access the admin dashboard. Returns both access token (short-lived) and refresh token (long-lived).

**How:** Validates username and password, creates JWT tokens with user information, updates last login time.

**Endpoint:** `POST /api/v1/auth/login`

**Authentication:** Not required

**Request Body:**
```json
{
  "username": "superadmin",
  "password": "YourSecurePassword123!"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "YourSecurePassword123!"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJlbWFpbCI6ImFkbWluQGlwcG9wYXkuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwiZGVwYXJ0bWVudCI6bnVsbCwidG9rZW5fdHlwZSI6ImFjY2VzcyIsImV4cCI6MTczMzQ0NjgwMCwiaWF0IjoxNzMzNDQ1OTAwfQ.abc123...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6InN1cGVyYWRtaW4iLCJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTczNDA1MDcwMCwiaWF0IjoxNzMzNDQ1OTAwfQ.xyz789...",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "id": 1,
      "username": "superadmin",
      "email": "admin@ippopay.com",
      "full_name": "Super Administrator",
      "role": "super_admin",
      "department": null
    }
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "detail": "Invalid username or password"
}
```

---

### 2. Refresh Access Token

**Purpose:** Get a new access token using the refresh token when the access token expires.

**Why:** Access tokens expire after 15 minutes for security. Instead of forcing users to re-login, they can use the refresh token (valid for 7 days) to get a new access token.

**How:** Validates refresh token, creates new access and refresh tokens, returns them to the client.

**Endpoint:** `POST /api/v1/auth/refresh`

**Authentication:** Not required (uses refresh token in body)

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 900
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "detail": "Invalid or expired refresh token"
}
```

---

### 3. Get Current User Info

**Purpose:** Get information about the currently logged-in user.

**Why:** Verify authentication is working, display user info in dashboard UI, check user's role and permissions.

**How:** Extracts user ID from JWT token, queries database for user details, returns user information.

**Endpoint:** `GET /api/v1/auth/me`

**Authentication:** Required (Bearer token)

**cURL Example:**
```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "username": "superadmin",
  "email": "admin@ippopay.com",
  "full_name": "Super Administrator",
  "role": "super_admin",
  "department": null,
  "is_active": true,
  "is_available": true,
  "last_login_at": "2025-12-05T18:30:00",
  "created_at": "2025-12-05T12:00:00"
}
```

---

### 4. Change Password

**Purpose:** Allow users to change their password.

**Why:** Security best practice to allow password changes, required when password is compromised, good UX to allow self-service password management.

**How:** Validates old password, checks new password strength, hashes new password with bcrypt, updates database.

**Endpoint:** `POST /api/v1/auth/change-password`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "old_password": "CurrentPassword123!",
  "new_password": "NewSecurePassword456!"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one digit (0-9)
- At least one special character (!@#$%^&*...)

**cURL Example:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "CurrentPassword123!",
    "new_password": "NewSecurePassword456!"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "detail": "Incorrect current password"
}
```

```json
{
  "detail": "Password must be at least 8 characters long"
}
```

---

### 5. Logout

**Purpose:** Logout the current user (client-side token deletion).

**Why:** Clear user session, remove tokens from client, security best practice.

**How:** This is primarily a client-side operation. The client should delete stored tokens. The endpoint confirms the action.

**Endpoint:** `POST /api/v1/auth/logout`

**Authentication:** Required (Bearer token)

**cURL Example:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Note:** Client must delete access_token and refresh_token from local storage.

---

## Admin User Management APIs

### 1. Create Admin User or Agent

**Purpose:** Create new admin users or agents in the system.

**Why:** Onboard new team members, create specialized agents for different departments, scale support team.

**How:** Validates permissions (only super_admin can create admins, admins can create agents), validates input data, checks uniqueness, hashes password, creates database record.

**Endpoint:** `POST /api/v1/admin/users`

**Authentication:** Required (Admin or Super Admin)

**Permissions:**
- Super Admin: Can create both admins and agents
- Admin: Can create agents only

**Request Body (Admin):**
```json
{
  "username": "admin_john",
  "email": "john.admin@ippopay.com",
  "password": "SecurePass123!",
  "full_name": "John Admin",
  "role": "admin"
}
```

**Request Body (Agent):**
```json
{
  "username": "agent_payment_1",
  "email": "payment1@ippopay.com",
  "password": "SecurePass123!",
  "full_name": "Payment Agent 1",
  "role": "agent",
  "department": "payment",
  "agent_capacity": 15
}
```

**Valid Roles:**
- `admin` - Can manage agents and view all tickets
- `agent` - Can view and manage only assigned tickets

**Valid Departments (for agents only):**
- `payment` - Payment, transaction, refund issues
- `loan` - Loan applications, eligibility queries
- `account` - Profile, KYC, registration issues
- `technical` - App errors, bugs, technical problems
- `general` - General inquiries, fallback department

**cURL Example (Create Agent):**
```bash
curl -X POST http://localhost:8000/api/v1/admin/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "agent_payment_1",
    "email": "payment1@ippopay.com",
    "password": "SecurePass123!",
    "full_name": "Payment Agent 1",
    "role": "agent",
    "department": "payment",
    "agent_capacity": 15
  }'
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "message": "Agent created successfully",
    "user": {
      "id": 5,
      "username": "agent_payment_1",
      "email": "payment1@ippopay.com",
      "full_name": "Payment Agent 1",
      "role": "agent",
      "department": "payment",
      "is_active": true
    }
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "detail": "Username 'agent_payment_1' already exists"
}
```

```json
{
  "detail": "Department is required for agents"
}
```

**Error Response (403 Forbidden):**
```json
{
  "detail": "Only super admin can create admin users"
}
```

---

### 2. List All Users

**Purpose:** Get a list of all admin users and agents with filtering and pagination.

**Why:** View all team members, filter by role/department/status, search for specific users, display in dashboard UI.

**How:** Queries database with filters, applies pagination, returns list with total count.

**Endpoint:** `GET /api/v1/admin/users`

**Authentication:** Required (Admin or Super Admin)

**Query Parameters:**
- `role` (optional) - Filter by role (admin, agent)
- `department` (optional) - Filter by department (payment, loan, account, technical, general)
- `is_active` (optional) - Filter by active status (true, false)
- `limit` (optional) - Max results per page (default: 100, max: 500)
- `offset` (optional) - Pagination offset (default: 0)

**cURL Example:**
```bash
# List all agents in payment department
curl -X GET "http://localhost:8000/api/v1/admin/users?role=agent&department=payment&limit=20&offset=0" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 5,
        "username": "agent_payment_1",
        "email": "payment1@ippopay.com",
        "full_name": "Payment Agent 1",
        "role": "agent",
        "department": "payment",
        "agent_capacity": 15,
        "is_active": true,
        "is_available": true,
        "created_at": "2025-12-05T12:30:00",
        "last_login_at": "2025-12-05T18:00:00"
      },
      {
        "id": 6,
        "username": "agent_payment_2",
        "email": "payment2@ippopay.com",
        "full_name": "Payment Agent 2",
        "role": "agent",
        "department": "payment",
        "agent_capacity": 10,
        "is_active": true,
        "is_available": false,
        "created_at": "2025-12-05T13:00:00",
        "last_login_at": "2025-12-05T17:30:00"
      }
    ],
    "total": 2,
    "limit": 20,
    "offset": 0
  }
}
```

---

### 3. Get User Details by ID

**Purpose:** Get detailed information about a specific user.

**Why:** View complete user profile, check user status, verify user details before editing.

**How:** Queries database for user by ID, returns all user information.

**Endpoint:** `GET /api/v1/admin/users/{user_id}`

**Authentication:** Required (Admin or Super Admin)

**cURL Example:**
```bash
curl -X GET http://localhost:8000/api/v1/admin/users/5 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 5,
      "username": "agent_payment_1",
      "email": "payment1@ippopay.com",
      "full_name": "Payment Agent 1",
      "role": "agent",
      "department": "payment",
      "agent_capacity": 15,
      "is_active": true,
      "is_available": true,
      "created_at": "2025-12-05T12:30:00",
      "updated_at": "2025-12-05T12:30:00",
      "last_login_at": "2025-12-05T18:00:00"
    }
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "detail": "User with ID 999 not found"
}
```

---

### 4. Update User Details

**Purpose:** Update user information like email, name, department, capacity, availability.

**Why:** Modify user settings, change agent department, adjust capacity based on performance, update contact info.

**How:** Validates permissions, checks data constraints (e.g., email uniqueness), updates database record.

**Endpoint:** `PUT /api/v1/admin/users/{user_id}`

**Authentication:** Required (Admin or Super Admin)

**Note:** Cannot update username, role, or password via this endpoint.

**Request Body:**
```json
{
  "email": "newemail@ippopay.com",
  "full_name": "Updated Full Name",
  "department": "technical",
  "agent_capacity": 20,
  "is_available": true
}
```

**Fields (all optional):**
- `email` - New email (must be unique)
- `full_name` - Updated full name
- `department` - New department (agents only)
- `agent_capacity` - New capacity (agents only, min: 1)
- `is_available` - Availability status (agents only)

**cURL Example:**
```bash
curl -X PUT http://localhost:8000/api/v1/admin/users/5 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_capacity": 20,
    "is_available": true
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "User updated successfully",
    "user": {
      "id": 5,
      "username": "agent_payment_1",
      "email": "payment1@ippopay.com",
      "full_name": "Payment Agent 1",
      "role": "agent",
      "department": "payment",
      "agent_capacity": 20,
      "is_active": true,
      "is_available": true
    }
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "detail": "Email 'payment1@ippopay.com' already exists"
}
```

---

### 5. Deactivate User

**Purpose:** Soft delete a user (mark as inactive).

**Why:** Remove user access without deleting data, preserve ticket history, reversible action.

**How:** Sets is_active=False, prevents login, preserves all associated data.

**Endpoint:** `DELETE /api/v1/admin/users/{user_id}`

**Authentication:** Required (Admin or Super Admin)

**Note:** Cannot deactivate super admin.

**cURL Example:**
```bash
curl -X DELETE http://localhost:8000/api/v1/admin/users/5 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "User 'agent_payment_1' deactivated successfully"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "detail": "Cannot deactivate super admin"
}
```

---

### 6. Activate User

**Purpose:** Reactivate a previously deactivated user.

**Why:** Restore user access, undo accidental deactivation, rehire previous employee.

**How:** Sets is_active=True, allows login again.

**Endpoint:** `PATCH /api/v1/admin/users/{user_id}/activate`

**Authentication:** Required (Admin or Super Admin)

**cURL Example:**
```bash
curl -X PATCH http://localhost:8000/api/v1/admin/users/5/activate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "User 'agent_payment_1' activated successfully"
  }
}
```

---

### 7. List Agents with Workload Statistics

**Purpose:** Get all agents with their current ticket workload and utilization percentage.

**Why:** Monitor agent performance, identify overloaded agents, balance workload, dashboard overview.

**How:** Queries all agents, counts active tickets for each, calculates utilization percentage, returns sorted by utilization (least busy first).

**Endpoint:** `GET /api/v1/admin/users/agents/stats`

**Authentication:** Required (Admin or Super Admin)

**Query Parameters:**
- `department` (optional) - Filter by department

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/admin/users/agents/stats?department=payment" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "agents": [
      {
        "agent_id": 5,
        "username": "agent_payment_1",
        "full_name": "Payment Agent 1",
        "department": "payment",
        "is_available": true,
        "capacity": 15,
        "tickets": {
          "active": 3,
          "resolved": 45,
          "closed": 38,
          "total": 86
        },
        "utilization": 20.0
      },
      {
        "agent_id": 6,
        "username": "agent_payment_2",
        "full_name": "Payment Agent 2",
        "department": "payment",
        "is_available": true,
        "capacity": 10,
        "tickets": {
          "active": 8,
          "resolved": 32,
          "closed": 28,
          "total": 68
        },
        "utilization": 80.0
      }
    ],
    "total_agents": 2
  }
}
```

**Explanation:**
- `active` - Tickets currently open or in_progress
- `resolved` - Tickets marked as resolved
- `closed` - Tickets marked as closed
- `total` - All tickets ever assigned to agent
- `utilization` - (active / capacity) * 100

---

### 8. Get Agent Statistics

**Purpose:** Get detailed statistics for a specific agent.

**Why:** View individual agent performance, track metrics, generate reports.

**How:** Queries agent info and ticket counts, calculates statistics, returns detailed breakdown.

**Endpoint:** `GET /api/v1/admin/users/agents/{agent_id}/stats`

**Authentication:** Required (Admin or Super Admin)

**cURL Example:**
```bash
curl -X GET http://localhost:8000/api/v1/admin/users/agents/5/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "agent_id": 5,
    "username": "agent_payment_1",
    "full_name": "Payment Agent 1",
    "department": "payment",
    "is_available": true,
    "capacity": 15,
    "tickets": {
      "active": 3,
      "resolved": 45,
      "closed": 38,
      "total": 86
    },
    "utilization": 20.0
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "detail": "Agent with ID 999 not found"
}
```

---

### 9. Toggle Agent Availability

**Purpose:** Mark agent as available or unavailable for new ticket assignments.

**Why:** Agent going on break/leave, temporary unavailability, prevent new assignments while agent completes current work.

**How:** Toggles is_available field, agents marked unavailable won't receive new auto-assignments.

**Endpoint:** `PATCH /api/v1/admin/users/agents/{agent_id}/availability`

**Authentication:** Required (Admin or Super Admin)

**cURL Example:**
```bash
curl -X PATCH http://localhost:8000/api/v1/admin/users/agents/5/availability \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Agent 'agent_payment_1' marked as unavailable",
    "agent": {
      "id": 5,
      "username": "agent_payment_1",
      "is_available": false
    }
  }
}
```

**Note:** Calling again will toggle back to available.

---

## Ticket Management APIs

### 1. List All Tickets

**Purpose:** Get a paginated list of all tickets with filtering options.

**Why:** View all support tickets, filter by status/category/agent, search capabilities, dashboard display.

**How:** Queries tickets table with filters, joins agent info, applies pagination, returns list with metadata.

**Endpoint:** `GET /api/v1/tickets`

**Authentication:** Required (Admin or Super Admin)

**Query Parameters:**
- `status` (optional) - Filter by status (open, in_progress, resolved, closed)
- `category` (optional) - Filter by category (payment, loan, account, technical, general)
- `assigned_agent_id` (optional) - Filter by assigned agent ID
- `unassigned` (optional) - Show only unassigned tickets (true/false)
- `from_date` (optional) - Start date filter (YYYY-MM-DD)
- `to_date` (optional) - End date filter (YYYY-MM-DD)
- `limit` (optional) - Max results per page (default: 50, max: 500)
- `offset` (optional) - Pagination offset (default: 0)

**cURL Example:**
```bash
# List all open payment tickets
curl -X GET "http://localhost:8000/api/v1/tickets?status=open&category=payment&limit=20&offset=0" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": 1,
        "ticket_id": "TKT2K9F3",
        "phone_number": "919876543210",
        "merchant_id": "MERCH123",
        "status": "in_progress",
        "category": "payment",
        "escalation_reason": "User requested human agent assistance",
        "assigned_agent_id": 5,
        "assigned_agent": {
          "id": 5,
          "username": "agent_payment_1",
          "full_name": "Payment Agent 1",
          "department": "payment"
        },
        "assigned_at": "2025-12-05T10:30:00",
        "auto_assigned": true,
        "reassignment_count": 0,
        "created_at": "2025-12-05T10:25:00",
        "updated_at": "2025-12-05T10:30:00",
        "resolved_at": null,
        "closed_at": null
      }
    ],
    "total": 1,
    "limit": 20,
    "offset": 0
  }
}
```

---

### 2. List Unassigned Tickets

**Purpose:** Get tickets waiting for agent assignment.

**Why:** Monitor ticket queue, manually assign urgent tickets, identify assignment failures.

**How:** Queries tickets where assigned_agent_id is NULL and status is 'open', calculates waiting time.

**Endpoint:** `GET /api/v1/tickets/unassigned`

**Authentication:** Required (Admin or Super Admin)

**Query Parameters:**
- `category` (optional) - Filter by category
- `limit` (optional) - Max results (default: 50, max: 500)

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/tickets/unassigned?category=loan" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": 15,
        "ticket_id": "TKT7H3M9",
        "phone_number": "919123456789",
        "merchant_id": null,
        "category": "loan",
        "escalation_reason": "User requested human agent assistance",
        "created_at": "2025-12-05T11:00:00",
        "waiting_time_minutes": 45
      }
    ],
    "total": 1
  }
}
```

**Use Case:** Dashboard alert when waiting_time_minutes > 30

---

### 3. Get Ticket Details

**Purpose:** Get complete ticket information including conversation history and activity log.

**Why:** View full ticket context, understand customer issue, track agent interactions, audit trail.

**How:** Retrieves ticket info, joins conversation messages, fetches activity log, combines all data.

**Endpoint:** `GET /api/v1/tickets/{ticket_id}`

**Authentication:** Required (Admin, Agent for own tickets)

**Access Control:**
- Admins: Can view any ticket
- Agents: Can only view their assigned tickets

**cURL Example:**
```bash
curl -X GET http://localhost:8000/api/v1/tickets/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "ticket": {
      "id": 1,
      "ticket_id": "TKT2K9F3",
      "phone_number": "919876543210",
      "merchant_id": "MERCH123",
      "status": "in_progress",
      "category": "payment",
      "escalation_reason": "User requested human agent assistance",
      "assigned_agent_id": 5,
      "assigned_agent": {
        "id": 5,
        "username": "agent_payment_1",
        "full_name": "Payment Agent 1",
        "email": "payment1@ippopay.com",
        "department": "payment"
      },
      "assigned_at": "2025-12-05T10:30:00",
      "auto_assigned": true,
      "reassignment_count": 0,
      "agent_response_count": 2,
      "resolution_notes": null,
      "created_at": "2025-12-05T10:25:00",
      "updated_at": "2025-12-05T15:30:00",
      "resolved_at": null,
      "closed_at": null,
      "conversation_history": [
        {
          "message": "My payment failed but money was deducted from my account",
          "response": "I understand you're facing a payment issue. Let me help you with that...",
          "timestamp": "2025-12-05T10:20:00"
        },
        {
          "message": "I need to speak with someone",
          "response": "I'll connect you with our support team. [RAISE_TICKET]",
          "timestamp": "2025-12-05T10:23:00"
        }
      ],
      "activities": [
        {
          "id": 3,
          "activity_type": "note_added",
          "description": "Checking payment gateway logs for transaction ID",
          "admin_user_id": 5,
          "metadata": {
            "added_by": "agent_payment_1",
            "added_by_role": "agent"
          },
          "created_at": "2025-12-05T15:30:00"
        },
        {
          "id": 1,
          "activity_type": "assigned",
          "description": "Ticket assigned to Payment Agent 1 (payment)",
          "admin_user_id": null,
          "metadata": {
            "agent_id": 5,
            "agent_username": "agent_payment_1",
            "agent_department": "payment",
            "auto_assigned": true,
            "method": "auto"
          },
          "created_at": "2025-12-05T10:30:00"
        }
      ]
    }
  }
}
```

**Error Response (403 Forbidden) - Agent accessing another's ticket:**
```json
{
  "detail": "Access denied. You can only view your assigned tickets."
}
```

---

### 4. Assign or Reassign Ticket

**Purpose:** Manually assign or reassign a ticket to a specific agent.

**Why:** Override auto-assignment, balance workload, assign urgent tickets, transfer to specialist.

**How:** Validates agent exists and is active, updates ticket assignment, logs activity with reason, updates status if needed.

**Endpoint:** `PATCH /api/v1/tickets/{ticket_id}/assign`

**Authentication:** Required (Admin or Super Admin)

**Request Body:**
```json
{
  "agent_id": 6,
  "reason": "Agent has expertise in this type of payment issue"
}
```

**cURL Example:**
```bash
curl -X PATCH http://localhost:8000/api/v1/tickets/1/assign \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": 6,
    "reason": "Agent has expertise in this type of payment issue"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Ticket assigned to Payment Agent 2",
    "ticket": {
      "id": 1,
      "ticket_id": "TKT2K9F3",
      "assigned_agent_id": 6,
      "assigned_at": "2025-12-05T16:00:00",
      "reassignment_count": 1
    }
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "detail": "Agent with ID 999 not found"
}
```

---

### 5. Update Ticket Status

**Purpose:** Change ticket status through its lifecycle.

**Why:** Track ticket progress, mark as resolved/closed, indicate agent is working on it.

**How:** Validates status value, updates ticket status, sets timestamps based on status, logs activity.

**Endpoint:** `PATCH /api/v1/tickets/{ticket_id}/status`

**Authentication:** Required (Admin, Agent for own tickets)

**Access Control:**
- Admins: Can update any ticket
- Agents: Can only update their assigned tickets

**Request Body:**
```json
{
  "status": "resolved",
  "resolution_notes": "Payment was successfully refunded to customer's account. Transaction ID: TXN123456"
}
```

**Valid Status Values:**
- `open` - Newly created, waiting for assignment
- `in_progress` - Agent is working on it
- `resolved` - Issue fixed, waiting for closure
- `closed` - Ticket completed

**Valid Status Transitions:**
- `open` → `in_progress`
- `in_progress` → `resolved`
- `resolved` → `closed`
- Any status → `open` (for reopening)

**cURL Example:**
```bash
curl -X PATCH http://localhost:8000/api/v1/tickets/1/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "resolved",
    "resolution_notes": "Payment was successfully refunded to customer account"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Ticket status updated to 'resolved'",
    "ticket": {
      "id": 1,
      "ticket_id": "TKT2K9F3",
      "status": "resolved",
      "updated_at": "2025-12-05T17:30:00",
      "resolved_at": "2025-12-05T17:30:00",
      "closed_at": null
    }
  }
}
```

**Error Response (403 Forbidden) - Agent updating another's ticket:**
```json
{
  "detail": "Access denied. You can only update your assigned tickets."
}
```

---

### 6. Update Ticket Category

**Purpose:** Change the ticket category.

**Why:** Correct miscategorization, move to appropriate department, improve reporting accuracy.

**How:** Validates category value, updates ticket category, logs activity. Note: Does NOT automatically reassign ticket.

**Endpoint:** `PATCH /api/v1/tickets/{ticket_id}/category`

**Authentication:** Required (Admin or Super Admin)

**Request Body:**
```json
{
  "category": "technical"
}
```

**Valid Categories:**
- `payment` - Payment, transaction, refund issues
- `loan` - Loan applications, eligibility
- `account` - Profile, KYC, registration
- `technical` - App errors, bugs
- `general` - General inquiries

**cURL Example:**
```bash
curl -X PATCH http://localhost:8000/api/v1/tickets/1/category \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "technical"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Ticket category updated to 'technical'",
    "ticket": {
      "id": 1,
      "ticket_id": "TKT2K9F3",
      "category": "technical",
      "updated_at": "2025-12-05T18:00:00"
    }
  }
}
```

**Note:** After changing category, you may want to reassign the ticket to an agent in the new department using the `/assign` endpoint.

---

### 7. Add Internal Note to Ticket

**Purpose:** Add internal notes for documentation, context sharing, investigation tracking.

**Why:** Document actions taken, share info with other agents/admins, track investigation progress, maintain audit trail.

**How:** Creates activity record with type 'note_added', stores note text, records who added it.

**Endpoint:** `POST /api/v1/tickets/{ticket_id}/notes`

**Authentication:** Required (Admin, Agent for own tickets)

**Access Control:**
- Admins: Can add notes to any ticket
- Agents: Can only add notes to their assigned tickets

**Request Body:**
```json
{
  "note": "Contacted customer via phone. Customer confirmed payment was refunded. Closing ticket after 24 hours if no response."
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8000/api/v1/tickets/1/notes \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "note": "Contacted customer via phone. Customer confirmed payment was refunded."
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Note added successfully",
    "note": {
      "id": 8,
      "note": "Contacted customer via phone. Customer confirmed payment was refunded.",
      "added_by": "Payment Agent 1",
      "created_at": "2025-12-05T18:30:00"
    }
  }
}
```

---

### 8. Get Ticket Activity Log

**Purpose:** View complete audit trail of all actions performed on a ticket.

**Why:** Compliance, debugging, understanding ticket history, performance tracking.

**How:** Retrieves all TicketActivity records for ticket, orders by newest first, includes admin user info.

**Endpoint:** `GET /api/v1/tickets/{ticket_id}/activities`

**Authentication:** Required (Admin, Agent for own tickets)

**Access Control:**
- Admins: Can view activities for any ticket
- Agents: Can only view activities for their assigned tickets

**cURL Example:**
```bash
curl -X GET http://localhost:8000/api/v1/tickets/1/activities \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "ticket_id": "TKT2K9F3",
    "activities": [
      {
        "id": 8,
        "activity_type": "note_added",
        "description": "Contacted customer via phone. Customer confirmed payment was refunded.",
        "metadata": {
          "added_by": "agent_payment_1",
          "added_by_role": "agent"
        },
        "created_at": "2025-12-05T18:30:00",
        "admin_user": {
          "id": 5,
          "username": "agent_payment_1",
          "full_name": "Payment Agent 1",
          "role": "agent"
        }
      },
      {
        "id": 5,
        "activity_type": "status_updated",
        "description": "Status changed from 'in_progress' to 'resolved'",
        "metadata": {
          "old_status": "in_progress",
          "new_status": "resolved",
          "updated_by": "agent_payment_1",
          "resolution_notes": "Payment was successfully refunded to customer account"
        },
        "created_at": "2025-12-05T17:30:00",
        "admin_user": {
          "id": 5,
          "username": "agent_payment_1",
          "full_name": "Payment Agent 1",
          "role": "agent"
        }
      },
      {
        "id": 1,
        "activity_type": "assigned",
        "description": "Ticket assigned to Payment Agent 1 (payment)",
        "metadata": {
          "agent_id": 5,
          "agent_username": "agent_payment_1",
          "agent_department": "payment",
          "auto_assigned": true,
          "method": "auto"
        },
        "created_at": "2025-12-05T10:30:00",
        "admin_user": null
      }
    ],
    "total": 3
  }
}
```

**Activity Types:**
- `assigned` - Ticket assigned to agent (auto or manual)
- `reassigned` - Ticket reassigned to different agent
- `status_updated` - Status changed
- `category_updated` - Category changed
- `note_added` - Internal note added
- `created` - Ticket created (future use)
- `closed` - Ticket closed (future use)
- `reopened` - Ticket reopened (future use)

---

## Common Error Responses

### 401 Unauthorized
**When:** Missing, invalid, or expired access token

```json
{
  "detail": "Invalid or expired token"
}
```

**Solution:** Use refresh token to get new access token, or login again.

---

### 403 Forbidden
**When:** User doesn't have required permissions

```json
{
  "detail": "Access denied. Required roles: super_admin, admin"
}
```

**Solution:** Use account with appropriate role, or request permissions from admin.

---

### 404 Not Found
**When:** Resource doesn't exist

```json
{
  "detail": "Ticket with ID 999 not found"
}
```

**Solution:** Verify ID is correct, check if resource was deleted.

---

### 400 Bad Request
**When:** Invalid input data

```json
{
  "detail": "Password must be at least 8 characters long"
}
```

**Solution:** Fix input data according to validation rules.

---

### 500 Internal Server Error
**When:** Unexpected server error

```json
{
  "detail": "Failed to create user"
}
```

**Solution:** Check server logs, report to administrator.

---

## Database Setup

### 1. Initialize Database

Run the initialization script to create all tables:

```bash
python scripts/init_db.py
```

This creates:
- `users` - WhatsApp users
- `conversation_messages` - Conversation history
- `support_tickets` - Support tickets
- `admin_users` - Admin users and agents
- `ticket_activities` - Ticket activity log

---

### 2. Create Super Admin

Run the super admin creation script:

```bash
python scripts/create_super_admin.py
```

Follow the prompts to create your first super admin user.

**Example:**
```
=== Create Super Admin ===

Username (default: superadmin): superadmin
Email (default: admin@ippopay.com): admin@ippopay.com
Full Name (default: Super Administrator): Super Administrator

✅ Super admin created successfully!

Username: superadmin
Email: admin@ippopay.com
Password: xK9mP2sL5nQ8rT3v

⚠️  SAVE THIS PASSWORD! It will not be shown again.
```

---

### 3. Verify Setup

Check database tables:

```bash
python scripts/init_db.py --verify
```

Test authentication:

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "xK9mP2sL5nQ8rT3v"
  }'
```

---

## Quick Start Guide

### 1. Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Generate JWT secret
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Add to .env
JWT_SECRET_KEY=<generated-secret>

# Initialize database
python scripts/init_db.py

# Create super admin
python scripts/create_super_admin.py

# Start server
python src/main.py
```

### 2. Create Your First Agent
```bash
# Login as super admin
TOKEN=$(curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"YOUR_PASSWORD"}' \
  | jq -r '.data.access_token')

# Create payment agent
curl -X POST http://localhost:8000/api/v1/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "agent_payment_1",
    "email": "payment1@ippopay.com",
    "password": "SecurePass123!",
    "full_name": "Payment Agent 1",
    "role": "agent",
    "department": "payment",
    "agent_capacity": 15
  }'
```

### 3. Test Ticket Auto-Assignment

Send a WhatsApp message that triggers escalation:
```
"My payment failed but money was deducted"
```

The system will:
1. LLM detects it cannot help → adds `[RAISE_TICKET]`
2. Shows escalation button to user
3. User clicks "Yes"
4. System creates ticket
5. Auto-assigns to payment agent (lowest workload)
6. User receives confirmation with agent name

### 4. View Tickets
```bash
# List all tickets
curl -X GET "http://localhost:8000/api/v1/tickets" \
  -H "Authorization: Bearer $TOKEN"

# View agent workload
curl -X GET "http://localhost:8000/api/v1/admin/users/agents/stats" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Support

For issues or questions:
- Check logs: `tail -f logs/app.log`
- Review documentation: See `TICKET_MANAGEMENT_SETUP.md` and `AUTHENTICATION_SETUP.md`
- Report bugs: Create GitHub issue

---

**API Version:** 1.0.0
**Last Updated:** 2025-12-05
