# 🌟 EduGalaxy - Database-First Authentication System with PostgreSQL

A production-ready, role-based authentication and authorization system built with NestJS, TypeORM, and PostgreSQL using a **Database-First approach**. Features JWT tokens, fine-grained permissions, and follows SOLID principles.

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Database-First Approach](#-database-first-approach)
- [Architecture](#️-architecture)
- [Database Setup](#-database-setup)
- [API Documentation](#-api-documentation)
- [Security Features](#-security-features)
- [Testing](#-testing)
- [Production Deployment](#-production-deployment)
- [Troubleshooting](#-troubleshooting)

## 🚀 Features

### Authentication & Authorization

- ✅ **JWT Authentication** with access and refresh tokens
- ✅ **Role-Based Access Control (RBAC)** - Admin and Student roles
- ✅ **Fine-grained Permissions** - Granular control over actions
- ✅ **Password Security** - Bcrypt hashing with strength validation
- ✅ **Token Management** - Automatic refresh and expiration handling

### Database & Infrastructure

- ✅ **PostgreSQL** with TypeORM integration
- ✅ **Database-First Development** - SQL scripts define schema
- ✅ **Entity Scaffolding** - Auto-generate TypeORM entities from database
- ✅ **Auto-Initialization** - Create database and seed data on first run
- ✅ **Connection Pooling** for better performance
- ✅ **UUID Primary Keys** for better security

### Development Experience

- ✅ **SOLID Principles** - Clean, maintainable architecture
- ✅ **Global Exception Handling** - Consistent error responses
- ✅ **Input Validation** - Comprehensive request validation
- ✅ **TypeScript** - Full type safety
- ✅ **Decorators** - Easy-to-use permission decorators
- ✅ **Seed Scripts** - Quick demo data setup

## 🗄️ Database-First Approach

This project uses a **Database-First** approach where:

1. **SQL Scripts** define the database schema in `src/database/sql-scripts/`
2. **Auto-Execution** runs SQL scripts automatically on app startup
3. **Entity Generation** creates TypeORM entities from existing database structure
4. **No Migrations** needed - SQL scripts are the source of truth

### Benefits:

- 🎯 **Direct Control** over database schema
- 🔄 **Easy Collaboration** with database designers
- 📊 **SQL-Native** approach for complex schemas
- 🚀 **Quick Setup** with auto-initialization

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (recommended)
- Or PostgreSQL 12+ installed locally

### 1. Clone and Install

```bash
git clone <repository-url>
cd EduGalaxy/Service
npm install
```

### 2. Database Setup (Docker - Recommended)

```bash
# Start PostgreSQL and pgAdmin
docker-compose up -d

# Copy environment configuration
cp .env.example .env
```

### 3. Initialize Database

```bash
# Sync database schema (development only)
npm run schema:sync

# Seed demo users
npm run seed
```

### 4. Start Application

```bash
npm run start:dev
```

Your API will be available at `http://localhost:3000`

### 5. Test the API

```bash
# Login with demo admin
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@edugalaxy.com",
    "password": "Admin123!"
  }'
```

## 🏗️ Architecture

### Project Structure

```
src/
├── auth/                     # Authentication module
│   ├── decorators/          # @Roles, @RequirePermissions, @CurrentUser
│   ├── dto/                 # Data Transfer Objects
│   ├── guards/              # JWT, Roles, Permissions guards
│   ├── services/            # Auth, Token services
│   ├── strategies/          # Passport JWT strategy
│   └── auth.controller.ts   # Authentication endpoints
├── common/                  # Shared components
│   ├── dto/                 # ApiResponse wrapper
│   ├── enums/               # Roles and Permissions
│   ├── exceptions/          # Custom exceptions
│   ├── filters/             # Global exception filter
│   ├── interfaces/          # TypeScript interfaces
│   └── services/            # Password, RolePermission services
├── entities/                # TypeORM entities
│   └── generated/           # Auto-generated entities from database
├── repositories/            # Data access layer
├── user/                    # User management module
├── database/                # SQL scripts for database-first approach
│   └── sql-scripts/         # Database schema and seed data
└── scripts/                 # Database management scripts
```

### SOLID Principles Implementation

**Single Responsibility**

- `AuthService` - Authentication logic only
- `TokenService` - JWT operations only
- `PasswordService` - Password operations only

**Open/Closed**

- Easy to add new roles via enums
- Extensible permission system
- Combinable guards for complex rules

**Liskov Substitution**

- All guards implement CanActivate
- Services follow their interfaces

**Interface Segregation**

- Focused interfaces (IAuthPayload, IUserResponse)
- Clients depend only on methods they use

**Dependency Inversion**

- High-level modules depend on abstractions
- Easy to substitute implementations for testing

## 🐘 Database Setup

### Option 1: Docker (Recommended)

```bash
# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs postgres
```

**Services Started:**

- PostgreSQL on port 5432
- pgAdmin on port 8080 (admin@edugalaxy.com / admin123)

### Option 2: Local PostgreSQL

```bash
# Install PostgreSQL
# Create database
createdb -U postgres edugalaxy

# Enable UUID extension
psql -U postgres -d edugalaxy -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
```

### Database Commands

```bash
# Create database
npm run db:create

# Execute SQL scripts
npm run db:execute-scripts

# Generate TypeORM entities from database
npm run db:scaffold

# Full setup (create DB + scripts + entities)
npm run db:full-setup

# Start app without auto-initialization
npm run start:no-auto-init
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "Password123!",
  "role": "student"
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}
```

#### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Get Profile

```http
GET /auth/profile
Authorization: Bearer <access-token>
```

### Protected Endpoints Examples

#### Admin Only

```http
GET /users
Authorization: Bearer <admin-token>
```

#### Permission-based

```http
POST /users/enroll/course-123
Authorization: Bearer <student-token>
```

### Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": {
    /* response data */
  },
  "message": "Operation successful",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔒 Security Features

### Roles and Permissions

**Admin Role:**

- `USER_CREATE`, `USER_READ`, `USER_UPDATE`, `USER_DELETE`
- `ADMIN_MANAGE_USERS`, `ADMIN_MANAGE_COURSES`
- `ADMIN_VIEW_ANALYTICS`, `ADMIN_SYSTEM_CONFIG`

**Student Role:**

- `USER_READ`, `USER_UPDATE` (own profile)
- `STUDENT_ENROLL`, `STUDENT_VIEW_COURSES`
- `STUDENT_SUBMIT_ASSIGNMENT`

### Using Combined Roles and Permissions

```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesPermissionsGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  @Get('users')
  @RequireAnyPermission(
    DefaultPermissions.MANAGE_USERS,
    DefaultPermissions.VIEW_ALL_REPORTS,
  )
  async getUsers() {
    // Requires admin role AND (MANAGE_USERS OR VIEW_ALL_REPORTS permission)
  }

  @Delete('users/:id')
  @RequireAllPermissions(DefaultPermissions.MANAGE_USERS)
  async deleteUser() {
    // Requires admin role AND MANAGE_USERS permission
  }
}
```

### Password Security

- Bcrypt with 12 salt rounds
- Password strength validation (8+ chars, uppercase, lowercase, digit, special char)
- Secure password comparison

### Token Security

- Separate secrets for access/refresh tokens
- Short-lived access tokens (15 minutes)
- Longer refresh tokens (7 days)
- Automatic token validation and refresh

## 🧪 Testing

### Demo Credentials

After running the seed script:

- **Admin**: `admin@edugalaxy.com` / `Admin123!`
- **Student**: `student@edugalaxy.com` / `Student123!`

### Manual Testing Flow

```bash
# 1. Start services
docker-compose up -d
npm run start:dev

# 2. Create demo users
npm run seed

# 3. Test authentication
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@edugalaxy.com", "password": "Admin123!"}'

# 4. Use token for protected endpoints
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer <your-access-token>"
```

### Unit Tests

```bash
npm run test
npm run test:watch
npm run test:cov
```

### E2E Tests

```bash
npm run test:e2e
```

## 🚀 Production Deployment

### Environment Configuration

```bash
# Database
DB_HOST=your-prod-db-host
DB_PORT=5432
DB_USERNAME=your-prod-user
DB_PASSWORD=your-secure-password
DB_NAME=edugalaxy_prod

# JWT (Generate strong random keys)
JWT_ACCESS_SECRET=your-super-secure-random-key-256-bits
JWT_REFRESH_SECRET=your-different-super-secure-random-key-256-bits

# Application
NODE_ENV=production
PORT=3000
BCRYPT_ROUNDS=12
```

### Security Checklist

- [ ] Use strong, random JWT secrets
- [ ] Enable SSL for database connections
- [ ] Set up proper CORS origins
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Regular security updates
- [ ] Database backups

### Performance Optimization

- [ ] Connection pooling configured
- [ ] Database indexes on frequently queried fields
- [ ] Enable gzip compression
- [ ] Use Redis for session storage (future enhancement)
- [ ] Monitor query performance

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**

```bash
# Check if PostgreSQL is running
docker-compose ps

# Check logs
docker-compose logs postgres

# Test connection
psql -h localhost -U postgres -d edugalaxy -c "SELECT 1;"
```

**Authentication Errors**

- Verify JWT secrets in .env
- Check token expiration
- Ensure user exists and is active

**Permission Denied**

- Check user role and permissions
- Verify guard configuration
- Review decorator usage

**Build Errors**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run build
```

### Debug Mode

Enable detailed logging:

```bash
NODE_ENV=development
```

### Database Debug

```bash
# Connect to database
psql -h localhost -U postgres -d edugalaxy

# Check tables
\dt

# View users
SELECT id, email, username, role, "isActive" FROM users;

# Check permissions
SELECT username, role, permissions FROM users;
```

## 📖 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)

## 🤝 Contributing

1. Follow SOLID principles
2. Write comprehensive tests
3. Document new features
4. Follow existing code style
5. Update README for new features

## 📄 License

[Your License Here]

---

**Built with ❤️ using NestJS, TypeORM, and PostgreSQL**
