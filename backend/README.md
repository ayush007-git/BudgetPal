# BudgetPal Backend API

A comprehensive user management API for BudgetPal with authentication, signup, login, and forgot password functionality.

## Features

- ✅ User Signup (username + password only)
- ✅ User Login with JWT authentication
- ✅ Forgot Password with emergency question verification
- ✅ Emergency question management
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ PostgreSQL database integration with Sequelize ORM
- ✅ Error handling middleware
- ✅ Input validation
- ✅ Database management endpoints for testing

## Environment Configuration

You can use a single `DATABASE_URL` for cloud Postgres (Render, Supabase, Railway) or local discrete variables. The server prefers `DATABASE_URL` when present.

```env
# Preferred: unified connection string
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DBNAME

# Optional fallbacks if DATABASE_URL is not set
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=budgetpal

JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up PostgreSQL database:
```bash
# Create database
createdb budgetpal

# Or using psql
psql -U postgres
CREATE DATABASE budgetpal;
\q
```

3. Set up environment variables:
Create a `.env` file in the backend directory:

**For Cloud Deployment (Recommended):**
```env
# Single connection string for cloud PostgreSQL (Render, Supabase, Railway, etc.)
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DBNAME

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**For Local Development:**
```env
# Database Configuration
POSTGRES_DB=budgetpal
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password_here
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**Note:** The server prioritizes `DATABASE_URL` if present, falling back to individual POSTGRES_* variables.

4. Start the server:
```bash
npm start
```

The server will automatically create the necessary tables in PostgreSQL on startup.

## Cloud PostgreSQL Setup (Recommended)

### Option 1: Supabase (Free Tier)
1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Wait for database to be ready

2. **Get Connection String:**
   - Go to Settings → Database
   - Copy the "Connection string" (URI format)
   - Replace `[YOUR-PASSWORD]` with your database password

3. **Set Environment Variables:**
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=3000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

### Option 2: Render (Free Tier)
1. **Create PostgreSQL Database:**
   - Go to [render.com](https://render.com)
   - Create new PostgreSQL database
   - Copy the "External Database URL"

2. **Set Environment Variables:**
   ```env
   DATABASE_URL=postgres://[USER]:[PASSWORD]@[HOST]:5432/[DATABASE]
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=3000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

### Option 3: Railway
1. **Create PostgreSQL Database:**
   - Go to [railway.app](https://railway.app)
   - Create new PostgreSQL database
   - Copy the "DATABASE_URL" from Variables tab

2. **Set Environment Variables:**
   ```env
   DATABASE_URL=[RAILWAY_DATABASE_URL]
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=3000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

### Testing Cloud Connection
After setting up your `.env` file with `DATABASE_URL`:
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running at port 3000
📱 API Documentation: http://localhost:3000
PostgreSQL connected successfully
Database synchronized
```

## API Endpoints

### Authentication Routes

#### 1. User Signup
- **POST** `/api/auth/signup`
- **Description**: Register a new user with username and password only
- **Body**:
```json
{
  "username": "johndoe",
  "password": "password123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "user_id",
      "username": "johndoe",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

#### 2. User Login
- **POST** `/api/auth/login`
- **Description**: Login user with username and password
- **Body**:
```json
{
  "username": "johndoe",
  "password": "password123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "username": "johndoe",
      "lastLogin": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

#### 3. Forgot Password
- **POST** `/api/auth/forgot-password`
- **Description**: Reset password using emergency question verification
- **Body**:
```json
{
  "username": "johndoe",
  "emergencyAnswer": "my_answer",
  "newPassword": "newpassword123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

#### 4. Get Emergency Question
- **GET** `/api/auth/emergency-question/:username`
- **Description**: Get emergency question for a user
- **Response**:
```json
{
  "success": true,
  "data": {
    "emergencyQuestion": "What is your mother's maiden name?"
  }
}
```

#### 5. Set Emergency Question (for onboarding)
- **PUT** `/api/auth/set-emergency-question`
- **Description**: Set emergency question and answer during onboarding
- **Body**:
```json
{
  "username": "johndoe",
  "emergencyQuestion": "What is your mother's maiden name?",
  "emergencyAnswer": "Smith"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Emergency question set successfully"
}
```

## Database Schema

### User Model (PostgreSQL Table: `users`)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(30) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  emergency_question TEXT NOT NULL,
  emergency_answer VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);
```

### Sequelize Model Definition
```javascript
{
  id: INTEGER (Primary Key, Auto Increment),
  username: STRING(30) (required, unique, 3-30 chars),
  password: STRING (required, min 6 chars, hashed),
  emergencyQuestion: TEXT (required),
  emergencyAnswer: STRING (required, hashed),
  createdAt: DATE,
  updatedAt: DATE,
  lastLogin: DATE
}
```

## Database Management Endpoints

### Testing and Development
- **DELETE** `/api/database/clear` - Clear all users from database
- **GET** `/api/database/stats` - Get database statistics
- **GET** `/api/database/users` - List all users (excludes sensitive data)

⚠️ **Warning**: These endpoints are for testing purposes only and should be restricted in production.

## PostgreSQL Setup

### Local Development
1. **Install PostgreSQL**:
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - macOS: `brew install postgresql`
   - Ubuntu: `sudo apt-get install postgresql postgresql-contrib`

2. **Start PostgreSQL service**:
   ```bash
   # Windows
   net start postgresql-x64-13
   
   # macOS
   brew services start postgresql
   
   # Ubuntu
   sudo systemctl start postgresql
   ```

3. **Create database and user**:
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE budgetpal;
   
   # Create user (optional)
   CREATE USER budgetpal_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE budgetpal TO budgetpal_user;
   
   # Exit
   \q
   ```

### Docker Setup (Alternative)
```bash
# Run PostgreSQL in Docker
docker run --name budgetpal-postgres \
  -e POSTGRES_DB=budgetpal \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:13
```

### Environment Variables
Make sure your `.env` file matches your PostgreSQL setup:
```env
POSTGRES_DB=budgetpal
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

## Security Features

- Passwords are hashed using bcrypt with salt rounds of 10
- Emergency answers are also hashed for security
- JWT tokens expire after 24 hours
- Input validation on all endpoints
- CORS enabled for cross-origin requests
- Comprehensive error handling

## Usage Flow

1. **Signup**: User creates account with username and password
2. **Onboarding**: User sets emergency question and answer (separate process)
3. **Login**: User logs in with username and password
4. **Forgot Password**: User can reset password by answering emergency question

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Troubleshooting

### Database Connection Issues
1. **PostgreSQL not running**:
   ```bash
   # Check if PostgreSQL is running
   pg_ctl status
   
   # Start PostgreSQL
   pg_ctl start
   ```

2. **Connection refused**:
   - Check if PostgreSQL is running on the correct port (5432)
   - Verify your `.env` file has correct credentials
   - Ensure the database exists

3. **Authentication failed**:
   - Check username and password in `.env`
   - Verify user has access to the database

### Common Errors
- **"relation 'users' does not exist"**: Run the server once to create tables
- **"password authentication failed"**: Check PostgreSQL user credentials
- **"database does not exist"**: Create the database first

### Testing
Use the provided `test.rest` file with REST Client extension in VS Code to test all endpoints.

### Group & Expense Routes

#### Groups
- **POST** `/api/groups/` — Create a new group
  - Body:
  ```json
  {
    "name": "Trip to Goa",
    "description": "Friends trip"
  }
  ```
- **POST** `/api/groups/:groupId/members` — Add a user to a group
  - Body:
  ```json
  {
    "userId": 1
  }
  ```
- **GET** `/api/groups/:groupId` — Get group details
- **GET** `/api/groups/:groupId/balance` — Get simplified settlement plan for all unpaid debts

#### Expenses
- **POST** `/api/groups/:groupId/expenses` — Create a new expense in a group
  - Body:
  ```json
  {
    "totalAmount": 1200,
    "description": "Dinner",
    "paidById": 2,
    "screenshotUrl": "https://example.com/receipt.png"
  }
  ```

### Models Overview
- `User` — name, email (unique), password
- `Group` — name, description
- `Expense` — description, totalAmount, screenshotUrl, date; belongs to `Group` and `User` (as `paidBy`)
- `Debt` — amount, status ('unpaid' | 'resolved'); belongs to `Expense`, `User` (as `Payer` and `Debtor`)


## Migration from MongoDB

If migrating from MongoDB:
1. Export your data from MongoDB
2. Update your `.env` file with PostgreSQL credentials
3. Install new dependencies: `npm install`
4. Start the server to create PostgreSQL tables
5. Import your data into PostgreSQL (manual process)

## Deployment

### Deploy to Render (Recommended)

1. **Create PostgreSQL Database on Render**:
   - Go to [render.com](https://render.com)
   - Create new PostgreSQL database
   - Copy the `DATABASE_URL`

2. **Deploy Backend Service**:
   - Create new Web Service
   - Connect your GitHub repository
   - Set environment variables:
     - `DATABASE_URL`: Your PostgreSQL URL from Render
     - `JWT_SECRET`: Generate a strong secret
     - `NODE_ENV`: `production`
     - `CORS_ORIGIN`: Your frontend URL

3. **Build & Start Commands**:
   - Build: `cd backend && npm install`
   - Start: `cd backend && npm start`

### Deploy to Vercel (Alternative)

1. **Set up Cloud PostgreSQL** (Supabase, Railway, or Render)
2. **Deploy to Vercel**:
   - Connect your GitHub repository
   - Set environment variables:
     - `DATABASE_URL`: Your cloud PostgreSQL URL
     - `JWT_SECRET`: Generate a strong secret
     - `NODE_ENV`: `production`
     - `CORS_ORIGIN`: Your frontend URL
3. **Build Settings**:
   - Build Command: `cd backend && npm install`
   - Output Directory: `backend`
   - Install Command: `npm install`

### Environment Variables for Render

```env
NODE_ENV=production
DATABASE_URL=postgres://user:pass@host:port/db
JWT_SECRET=your_production_jwt_secret
CORS_ORIGIN=https://your-frontend.onrender.com
```

### Render Configuration

The `render.yaml` file in the root directory provides automatic deployment configuration.

## Production Considerations

- Use environment variables for all sensitive data
- Set up proper database backups
- Use connection pooling for better performance
- Implement proper logging
- Add rate limiting
- Use HTTPS in production
- Restrict database management endpoints
- Configure CORS for your frontend domain
