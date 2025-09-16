# BudgetPal Backend API

A comprehensive user management API for BudgetPal with authentication, signup, login, and forgot password functionality.

## Features

- ✅ User Signup (username + password only)
- ✅ User Login with JWT authentication
- ✅ Forgot Password with emergency question verification
- ✅ Emergency question management
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ MongoDB database integration
- ✅ Error handling middleware
- ✅ Input validation

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the backend directory:
```
MONGODB_URI=mongodb://localhost:27017/budgetpal
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
PORT=3000
```

3. Start MongoDB (if running locally):
```bash
mongod
```

4. Start the server:
```bash
npm start
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

### User Model
```javascript
{
  username: String (required, unique, 3-30 chars),
  password: String (required, min 6 chars, hashed),
  emergencyQuestion: String (required),
  emergencyAnswer: String (required, hashed),
  createdAt: Date,
  lastLogin: Date
}
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
