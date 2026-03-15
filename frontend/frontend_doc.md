# URL Shortener — Frontend Integration Document

> **Purpose**: This document contains everything a frontend developer needs to build the UI for this URL Shortener backend. Read it top-to-bottom before writing a single line of frontend code.

---

## 1. Project Overview

A full-stack **URL Shortener** built with:
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js v5
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: JWT (JSON Web Tokens), 1-hour expiry
- **Password Hashing**: HMAC-SHA256 with random salt

**Base URL** (local development): `http://localhost:8000`

---

## 2. Authentication Model

The backend uses **JWT Bearer Token** authentication.

### How it works:
1. User signs up → gets a `userId` back.
2. User logs in → gets a `token` (JWT) back.
3. For **every protected route**, send the token in the HTTP header:

```
Authorization: Bearer <your_jwt_token>
```

- Tokens expire after **1 hour**.
- If the token is missing or invalid, the API returns `401 Unauthorized`.
- Store the token in `localStorage` or `sessionStorage` on the frontend.

---

## 3. Data Models

### Users Table (`users`)
| Column | Type | Notes |
|---|---|---|
| [id](file:///c:/Users/YASH/Desktop/URL%20Shortner/utils/jwt.js#7-14) | UUID | Primary key, auto-generated |
| `first_name` | VARCHAR(55) | Required |
| `last_name` | VARCHAR(55) | Optional |
| `email` | VARCHAR(200) | Required, unique |
| `password` | TEXT | Stored as HMAC-SHA256 hash |
| `salt` | TEXT | Random 256-byte salt |
| `created_at` | TIMESTAMP | Auto-set |
| `updated_at` | TIMESTAMP | Auto-updated |

### URL Table (`url`)
| Column | Type | Notes |
|---|---|---|
| [id](file:///c:/Users/YASH/Desktop/URL%20Shortner/utils/jwt.js#7-14) | UUID | Primary key, auto-generated |
| `code` | VARCHAR(10) | The short code, unique |
| `target_url` | TEXT | The original long URL |
| `user_id` | UUID | Foreign key → `users.id` |
| `created_at` | TIMESTAMP | Auto-set |
| `updated_at` | TIMESTAMP | Auto-updated |

---

## 4. API Endpoints Reference

### 4.1 Public Routes — No authentication required

These routes are under the `/user` prefix.

---

#### `POST /user/signup` — Register a new user

**Request Body (JSON):**
```json
{
  "firstname": "Yash",
  "lastname": "Sharma",
  "email": "yash@example.com",
  "password": "mypassword"
}
```

**Validation Rules:**
| Field | Rule |
|---|---|
| `firstname` | Required, string |
| `lastname` | Required, string |
| `email` | Required, must be valid email format |
| `password` | Required, minimum 3 characters |

**Success Response — `200 OK`:**
```json
{
  "data": {
    "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

**Error Responses:**
| Status | Condition | Response Body |
|---|---|---|
| `400` | Validation failure (bad email, short password, missing field) | `{ "error": "<zod error message>" }` |
| `400` | Email already registered | `{ "error": "user with the same email already exists" }` |

> **Frontend Note**: After successful signup, redirect the user to the **Login** page. Do NOT auto-login after signup.

---

#### `POST /user/login` — Login an existing user

**Request Body (JSON):**
```json
{
  "email": "yash@example.com",
  "password": "mypassword"
}
```

**Validation Rules:**
| Field | Rule |
|---|---|
| `email` | Required, string |
| `password` | Required, minimum 3 characters |

**Success Response — `200 OK`:**
```json
{
  "message": "User login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
| Status | Condition | Response Body |
|---|---|---|
| `400` | Validation failure | `{ "error": "<zod error message>" }` |
| `404` | Email not found | `{ "error": "user with this email <email> does not exist" }` |
| `400` | Wrong password | `{ "error": "Password entered is invalid" }` |

> **Frontend Note**: Save the `token` from the response to `localStorage` (key suggestion: `authToken`). After login, redirect to the **Dashboard**.

---

### 4.2 Protected Routes — JWT required

All routes below require the `Authorization: Bearer <token>` header.
If token is missing or expired → `401 { "error": "Unauthorized" }`.

---

#### `POST /shorten` — Create a short URL

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (JSON):**
```json
{
  "url": "https://www.example.com/some/very/long/path",
  "code": "mycode"
}
```

**Validation Rules:**
| Field | Rule |
|---|---|
| `url` | Required, must be a valid URL (with protocol, e.g., `https://`) |
| `code` | Optional, string. If omitted, an 8-character random code is auto-generated using `nanoid` |

**Success Response — `201 Created`:**
```json
{
  "id": "uuid-here",
  "shortCode": "mycode"
}
```

The resulting short URL is: `http://localhost:8000/<shortCode>`  
Example: `http://localhost:8000/mycode`

**Error Responses:**
| Status | Condition | Response Body |
|---|---|---|
| `401` | Missing or invalid token | `{ "error": "Unauthorized" }` |
| `400` | Invalid URL format or validation failure | `{ "error": { ... zod error object ... } }` |

> **Frontend Note**: After successful creation, display the generated short URL prominently (e.g., with a **Copy to Clipboard** button). Show `http://localhost:8000/<shortCode>`.

---

#### `GET /myCodes` — Get all short URLs created by the logged-in user

**Headers:**
```
Authorization: Bearer <token>
```

**No request body needed.**

**Success Response — `200 OK`:**
```json
{
  "your_codes": [
    {
      "id": "uuid-1",
      "code": "mycode",
      "target_url": "https://www.example.com/some/very/long/path",
      "user_id": "user-uuid",
      "created_at": "2026-03-15T10:00:00.000Z",
      "updated_at": null
    },
    {
      "id": "uuid-2",
      "code": "abc12345",
      "target_url": "https://another-site.com",
      "user_id": "user-uuid",
      "created_at": "2026-03-15T11:00:00.000Z",
      "updated_at": null
    }
  ]
}
```

**Error Responses:**
| Status | Condition |
|---|---|
| `401` | Missing or invalid token |

> **Frontend Note**: This is the primary data source for the **Dashboard** page. Render each item in a table or card with the short URL, original URL, and a copy button.

---

#### `GET /:code` — Redirect to the original URL

**Example Request:**
```
GET http://localhost:8000/mycode
```

**No headers or body needed for the basic redirect**, but this route IS behind [authMiddleware](file:///c:/Users/YASH/Desktop/URL%20Shortner/middleware/auth.middleware.js#11-20), meaning the user must send the token for the redirect to work.

**Success Response — `302 Found` (Redirect):**
The server performs `res.redirect(targetUrl)` — the browser is automatically sent to the original URL.

**Error Responses:**
| Status | Condition | Response Body |
|---|---|---|
| `401` | Missing or invalid token | `{ "error": "Unauthorized" }` |
| `404` | Short code does not exist | `{ "error": "<code> is invalid" }` |

> **Frontend Note**: Since this redirect requires auth, users must be logged in to use short URLs (or the short link must be opened in a context where the token is sent, e.g., via fetch). For sharing purposes, you may want to display the short URL and let the user open it themselves while logged in. Consider building a dedicated redirect page that reads the token from storage and calls this endpoint programmatically.

---

## 5. Complete API Summary Table

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/` | ❌ | Health check — returns `{ "status": "Server is running" }` |
| `POST` | `/user/signup` | ❌ | Register a new user |
| `POST` | `/user/login` | ❌ | Login, receive JWT token |
| `POST` | `/shorten` | ✅ Bearer Token | Create a new short URL |
| `GET` | `/myCodes` | ✅ Bearer Token | List all your short URLs |
| `GET` | `/:code` | ✅ Bearer Token | Redirect to the target URL |

---

## 6. Error Handling Guide

Always handle these error shapes on the frontend:

```json
// All error responses follow this shape:
{ "error": "Human-readable error message" }

// Or for validation errors from zod:
{ "error": { "issues": [...], "message": "..." } }
```

**Global error handling recommendations:**
- `400` → Show the error message near the relevant form field.
- `401` → Clear the stored token, redirect to Login page.
- `404` → Show a "Not Found" message (for invalid short codes).
- Network error → Show a generic "Something went wrong, please try again" message.

---

## 7. Frontend Pages to Build

### Page 1: Signup (`/signup`)
- **Fields**: First Name, Last Name, Email, Password
- **On Submit**: `POST /user/signup`
- **On Success**: Redirect to `/login` with a success toast
- **On Error**: Display error message inline

### Page 2: Login (`/login`)
- **Fields**: Email, Password
- **On Submit**: `POST /user/login`
- **On Success**: Save token to `localStorage`, redirect to `/dashboard`
- **On Error**: Display error message inline

### Page 3: Dashboard (`/dashboard`) ⭐ Main Page
- **Auth Guard**: If no token in `localStorage`, redirect to `/login`
- **On Load**: `GET /myCodes` (with Bearer token)
- **Display**: Table/cards showing `shortCode` and `target_url` for each entry
- **Short URL**: Display as `http://localhost:8000/<shortCode>` with a Copy button
- **Create Form**: Input for long URL + optional custom code → `POST /shorten`
- **On Create**: Refresh the list and show the new short URL
- **Logout Button**: Clears `localStorage` token, redirects to `/login`

### Page 4: Redirect Handler (`/r/:code` or similar) — Optional
- Since `/:code` requires auth, build a frontend page that:
  1. Reads the code from the URL path
  2. Reads token from `localStorage`
  3. Uses `fetch` (with Authorization header) to hit `GET /:code`
  4. Handles the redirect response manually or shows a "redirecting..." screen

---

## 8. Token Storage & Auth Flow

```
[User opens app]
       |
       v
Is token in localStorage?
       |
   Yes |                | No
       v                v
  [Dashboard]       [Login Page]
       |
       v
Token expired? (401 response from any API)
       |
       v
Clear token → Redirect to Login
```

**Recommended localStorage keys:**
```javascript
localStorage.setItem('authToken', token);        // On login
localStorage.getItem('authToken');               // On every API call
localStorage.removeItem('authToken');            // On logout or 401
```

**Attaching token to every protected API call:**
```javascript
const token = localStorage.getItem('authToken');

fetch('http://localhost:8000/myCodes', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 9. CORS Consideration

> [!IMPORTANT]
> The current backend does NOT have a CORS middleware configured. If the frontend is served from a different origin (e.g., `http://localhost:3000`), the browser will block API requests.
> 
> Before building the frontend, ask the backend developer to add the `cors` npm package and configure it in [index.js](file:///c:/Users/YASH/Desktop/URL%20Shortner/index.js). Example:
> ```js
> import cors from 'cors';
> web.use(cors({ origin: 'http://localhost:3000' }));
> ```

---

## 10. Tech Stack Recommendation for Frontend

| Concern | Recommendation |
|---|---|
| Framework | React (Vite) or plain HTML/CSS/JS |
| HTTP Calls | `fetch` API or `axios` |
| Routing | React Router (if React) |
| Token Storage | `localStorage` |
| Styling | TailwindCSS or plain CSS |
| Copy to Clipboard | `navigator.clipboard.writeText()` |

---

*Generated by analyzing the backend source: [index.js](file:///c:/Users/YASH/Desktop/URL%20Shortner/index.js), [routes/user.routes.js](file:///c:/Users/YASH/Desktop/URL%20Shortner/routes/user.routes.js), [routes/url.router.js](file:///c:/Users/YASH/Desktop/URL%20Shortner/routes/url.router.js), [middleware/auth.middleware.js](file:///c:/Users/YASH/Desktop/URL%20Shortner/middleware/auth.middleware.js), [models/schema.js](file:///c:/Users/YASH/Desktop/URL%20Shortner/models/schema.js), [models/url.js](file:///c:/Users/YASH/Desktop/URL%20Shortner/models/url.js), [utils/jwt.js](file:///c:/Users/YASH/Desktop/URL%20Shortner/utils/jwt.js), [validation/request.validation.js](file:///c:/Users/YASH/Desktop/URL%20Shortner/validation/request.validation.js), [db/index.js](file:///c:/Users/YASH/Desktop/URL%20Shortner/db/index.js)*
