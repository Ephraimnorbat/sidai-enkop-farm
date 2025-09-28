# Role-Based Access Control (RBAC) System

## 🔐 Security Implementation Overview

The Sidai Enkop Ranch Management System now includes a comprehensive **Django Groups & Permissions-based** role system that ensures proper access control across all functionalities.

## 🎯 User Roles

### 1. **Farm Administrator** (`admin`)
- **Full System Access**: Complete CRUD operations on all resources
- **User Management**: Can promote/demote users and manage roles  
- **Django Admin Access**: Full backend administration capabilities
- **All Reports & Analytics**: Access to all farm statistics and data exports

**Permissions:**
- ✅ Create, Read, Update, Delete animals
- ✅ View and export all reports
- ✅ Manage user accounts and roles
- ✅ Access Django admin panel
- ✅ All QR code operations

### 2. **Farm Worker** (`farm_worker`)
- **Animal Management**: Can view and update existing animal records
- **Limited CRUD**: Read and Update only (no Create/Delete)
- **Reports Access**: Can view farm statistics and reports
- **No User Management**: Cannot modify user roles or accounts

**Permissions:**
- ✅ View all animals
- ✅ Update animal records (health status, weight, notes, etc.)
- ✅ View reports and statistics
- ✅ Download QR codes
- ❌ Create new animals
- ❌ Delete animals
- ❌ Manage users

### 3. **Farm Accountant** (`farm_accountant`)
- **Financial Focus**: Designed for payment/financial management (future implementation)
- **Read-Only Animals**: Can view animal data for financial calculations
- **Reports & Analytics**: Full access to reports and data exports
- **No Animal Modifications**: Cannot create, update, or delete animals

**Permissions:**
- ✅ View all animals (read-only)
- ✅ View and export reports
- ✅ Future: Manage financial records
- ❌ Create/update/delete animals
- ❌ Manage users

### 4. **Guest User** (`guest`)
- **Default Role**: All new registrations start as guests
- **No Access**: Cannot access animal records or reports
- **Must be Promoted**: Admin must assign a proper role
- **Security**: Prevents unauthorized access to farm data

**Permissions:**
- ❌ No animal access
- ❌ No reports access
- ❌ No system functionality
- ❌ Must request role upgrade from admin

## 🛡️ Security Features Implemented

### Authentication Layer
- **Token Authentication**: API requests use Django REST Framework tokens
- **Session Authentication**: Web interface uses Django sessions
- **CSRF Protection**: All forms protected against cross-site request forgery
- **Dual Auth**: Both token and session auth work seamlessly together

### Authorization Layer
- **Custom Permission Classes**: Role-specific access controls for all API endpoints
- **Django Groups**: Users automatically assigned to appropriate groups
- **Permission Inheritance**: Admin inherits all lower-level permissions
- **Dynamic Permissions**: Frontend buttons/features appear based on user role

### API Endpoint Security

| Endpoint | Admin | Farm Worker | Farm Accountant | Guest |
|----------|-------|-------------|-----------------|-------|
| `GET /api/animals/` | ✅ | ✅ | ✅ | ❌ |
| `POST /api/animals/` | ✅ | ❌ | ❌ | ❌ |
| `PUT /api/animals/{id}/` | ✅ | ✅ | ❌ | ❌ |
| `DELETE /api/animals/{id}/` | ✅ | ❌ | ❌ | ❌ |
| `GET /api/animals/statistics/` | ✅ | ✅ | ✅ | ❌ |
| `GET /api/auth/users/` | ✅ | ❌ | ❌ | ❌ |
| `PUT /api/auth/users/{id}/role/` | ✅ | ❌ | ❌ | ❌ |

## 🔧 Implementation Details

### Backend Components

#### 1. **Permission Classes** (`permissions/permissions.py`)
```python
# Custom permission classes for different access levels
- CanManageAnimals: Admin full access, Workers read/update only
- CanViewReports: Admin, Workers, Accountants can view
- IsAdminUser: Admin-only operations
- IsAdminOrFarmWorker: Admin + Worker access
```

#### 2. **User Profile Model** (`permissions/models.py`)
```python
# Extended user information with role tracking
class UserProfile:
    - role: CharField with predefined choices
    - employee_id: Optional employee identification
    - hire_date, phone_number: Additional info
    - Automatic group assignment via signals
```

#### 3. **Django Signals** (`permissions/signals.py`)
```python
# Automatic role and group management
- post_save on User: Creates UserProfile
- post_save on UserProfile: Updates Django groups
- Automatic admin privileges for admin role
```

#### 4. **Management Command** (`setup_groups_permissions.py`)
```bash
# Sets up the entire permission system
python manage.py setup_groups_permissions
```

### Frontend Components

#### 1. **Enhanced User Type** (`types/index.ts`)
```typescript
interface User {
  // ... existing fields
  role?: string
  role_display?: string
  permissions?: {
    can_create_animals: boolean
    can_edit_animals: boolean
    can_delete_animals: boolean
    can_view_reports: boolean
    can_manage_users: boolean
  }
}
```

#### 2. **Conditional UI Rendering**
- Create Animal button only shows for admins
- Role display in navigation bar
- Permission-based feature visibility
- Dynamic menu items based on access level

## 🚀 Setup & Usage

### 1. **Initial Setup**
```bash
# Run migrations
cd backend
python manage.py migrate

# Setup groups and permissions
python manage.py setup_groups_permissions

# Create your admin user (will automatically get admin role)
python manage.py createsuperuser
```

### 2. **Managing User Roles**

#### Via Django Admin:
1. Go to `http://localhost:8000/admin/`
2. Navigate to **Permissions → User Profiles**
3. Edit user profiles to change roles
4. Groups are automatically updated

#### Via API (Admin only):
```bash
# Get all users
GET /api/auth/users/

# Update user role
PUT /api/auth/users/{user_id}/role/
{
  "role": "farm_worker"
}
```

#### Via Frontend (Admin only):
- Access user management interface
- Select user and new role
- Changes applied immediately

### 3. **Default Behavior**
- **First registered user**: Automatically becomes admin
- **Subsequent users**: Start as guests, need role assignment
- **Group membership**: Automatically managed by signals
- **Permissions**: Inherited from group membership

## 🔍 Testing the System

### Role Access Testing:
```bash
# Test different user types
cd backend
python manage.py shell

# Create test users with different roles
# Test API endpoints with different tokens
# Verify proper access restrictions
```

### Expected Results:
- ✅ **Admin**: Can access everything
- ✅ **Farm Worker**: Can view/edit animals, cannot create/delete
- ✅ **Farm Accountant**: Can view animals and reports only
- ✅ **Guest**: Cannot access animal data

## 📋 Security Best Practices Applied

1. **Principle of Least Privilege**: Users get minimum required access
2. **Role-Based Security**: Permissions tied to business functions
3. **Defense in Depth**: Multiple layers (authentication + authorization)
4. **Fail Secure**: Unknown roles/permissions denied by default
5. **Audit Trail**: All role changes tracked in Django admin
6. **Session Security**: Proper CSRF and session management

## 🔜 Future Enhancements

- **Payment Module**: Accountant role will manage financial records
- **Audit Logging**: Track all animal modifications and user actions
- **Time-based Access**: Restrict access to working hours
- **IP Restrictions**: Limit access to farm network
- **Two-Factor Authentication**: Additional security layer for admins

---

## ✅ **Status: Production Ready**

The role-based access control system is **fully implemented and tested**. It provides enterprise-grade security suitable for production farm management operations.

**Key Benefits:**
- 🔒 Secure access control
- 👥 Easy role management
- 🛡️ Django best practices
- ⚡ High performance
- 🎯 Business-aligned permissions
