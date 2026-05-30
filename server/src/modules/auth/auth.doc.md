# Authentication Module Documentation

## Overview

The authentication module provides a complete solution for user authentication and authorization in the Wareflow application. It follows modern best practices with a clear separation of concerns between data structure definition (DTOs), data validation (schemas), and business logic (services).

## Architecture

The authentication module follows a modular approach with these key components:

- **DTOs (Data Transfer Objects)**: Define the shape and structure of data
- **Schemas**: Handle validation rules and data format requirements
- **Controllers**: Handle HTTP requests and responses
- **Services**: Implement business logic
- **Middleware**: Provide cross-cutting functionality like request validation and role verification

## Components

### DTOs (Data Transfer Objects)

DTOs define the expected structure of data without any validation logic. They specify what fields are expected and their types.

```typescript
// src/modules/auth/dtos/auth.dto.ts
export interface SignupDto {
  username: string;
  password: string;
  email?: string;
}

export interface LoginDto {
  username: string;
  password: string;
}
```

### Schemas

Schemas define validation rules for incoming data using Zod. They enforce data integrity and format requirements.

```typescript
// src/modules/auth/schemas/auth.schema.ts
import { z } from 'zod';

export const SignupSchema = z.object({
  username: z.string()
    .min(4, { message: 'Username must be at least 4 characters long' })
    .max(32, { message: 'Username must be less than 32 characters' })
    .regex(/^[a-zA-Z0-9_]+$/, { 
      message: 'Username can only contain letters, numbers, and underscores' 
    }),
  
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters long' }),
  
  email: z.string()
    .email({ message: 'Please provide a valid email address' })
    .optional()
});

export const LoginSchema = z.object({
  username: z.string()
    .min(1, { message: 'Username is required' }),
  
  password: z.string()
    .min(1, { message: 'Password is required' })
});
```

### Middleware

#### Schema Validation Middleware

This middleware validates incoming request bodies against Zod schemas.

```typescript
// src/middlewares/schema-validator.middleware.ts
export const validateSchema = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = await schema.parseAsync(req.body);
      req.body = validatedData;
      next();
    } catch (error: any) {
      // Format and return validation errors
      // ...
    }
  };
};
```

#### Authentication Middleware

This middleware verifies JWT tokens and attaches the user to the request object.

```typescript
// src/middlewares/auth.middleware.ts
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Extract and verify the JWT token
  // Attach user to request
  // ...
};
```

#### Role Verification Middleware

This middleware checks if the authenticated user has the required role(s).

```typescript
// src/middlewares/role-verifier.middleware.ts
export const verifyRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if user has required roles
    // ...
  };
};
```

### Routes

Routes define API endpoints and connect them to controllers with appropriate middleware.

```typescript
// src/modules/auth/routes/auth.routes.ts
const authRouter = Router();

authRouter.post('/signup', validateSchema(SignupSchema), authController.signup);
authRouter.post('/login', validateSchema(LoginSchema), authController.login);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', authenticate, authController.getCurrentUser);
```

### Services

Services implement business logic for authentication operations.

```typescript
// src/modules/auth/services/auth.service.ts
class AuthService {
  async signup(data: SignupDto): Promise<{ user: any; token: string }> {
    // Business logic for user registration
    // ...
  }

  async login(data: LoginDto): Promise<{ user: any; token: string }> {
    // Business logic for user login
    // ...
  }

  validateToken(token: string): any {
    // Token validation logic
    // ...
  }

  private generateToken(user: User): string {
    // JWT token generation
    // ...
  }
}
```

### Controllers

Controllers handle HTTP requests and responses, delegating business logic to services.

```typescript
// src/modules/auth/controllers/auth.controller.ts
class AuthController {
  signup = async (req: Request, res: Response): Promise<void> => {
    // Handle signup request
    // ...
  };

  login = async (req: Request, res: Response): Promise<void> => {
    // Handle login request
    // ...
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    // Handle logout request
    // ...
  };

  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    // Return current authenticated user
    // ...
  };
}
```

## Authentication Flow

1. **Registration (Signup)**:
   - Client sends username, password, and optional email
   - Schema validation middleware validates the request
   - Service checks for existing username/email
   - Password is hashed securely
   - User record is created in the database
   - JWT token is generated and returned

2. **Login**:
   - Client sends username and password
   - Schema validation middleware validates the request
   - Service verifies credentials
   - JWT token is generated and returned

3. **Authentication**:
   - Client includes JWT token in Authorization header
   - Authentication middleware validates the token
   - User information is attached to the request

4. **Authorization**:
   - Role verification middleware checks user roles
   - Access is granted or denied based on roles

## API Endpoints

| Endpoint        | Method | Description                     | Required Body                      | Response                            |
|-----------------|--------|---------------------------------|-----------------------------------|-------------------------------------|
| `/auth/signup`  | POST   | Register a new user             | `{ username, password, email? }`  | `{ message, user, token }`          |
| `/auth/login`   | POST   | Authenticate a user             | `{ username, password }`          | `{ message, user, token }`          |
| `/auth/logout`  | POST   | Log out a user                  | None                              | `{ message }`                       |
| `/auth/me`      | GET    | Get current authenticated user  | None                              | `{ user }`                          |

## Security Considerations

1. **Password Storage**: Passwords are hashed using bcrypt with salt
2. **Token Security**: JWTs are signed with a secret key and have expiration
3. **Input Validation**: All inputs are validated using Zod schemas
4. **Role-Based Access**: Endpoints are protected based on user roles
5. **Error Handling**: Error messages don't leak sensitive information

## Example Usage

### Signup Request

```http
POST /auth/signup
Content-Type: application/json

{
  "username": "johndoe",
  "password": "Password123",
  "email": "john@example.com"
}
```

### Login Request

```http
POST /auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "Password123"
}
```

### Authenticated Request

```http
GET /auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Dependencies

- **jsonwebtoken**: For JWT token generation and verification
- **bcryptjs**: For secure password hashing
- **zod**: For schema validation
- **prisma**: For database operations

## Best Practices

1. **Separation of Concerns**: Clear separation between DTOs, validation, and business logic
2. **Type Safety**: Strong typing throughout the module
3. **Security First**: Focus on secure authentication practices
4. **Middleware Approach**: Reusable middleware for common operations
5. **Error Handling**: Comprehensive error handling at each layer