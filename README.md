# RoomSearch Backend API

A RESTful API for a hostel room swap/exchange application built with Node.js, Express, and MongoDB.

## Features

- ✅ Create room swap listings
- ✅ View all active listings
- ✅ Filter listings by hostel block and floor
- ✅ Find perfect matches (mutual swap partners)
- ✅ Update and delete listings
- ✅ Soft delete functionality
- ✅ Intelligent matching algorithm

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Middleware**: CORS, Body-Parser

## Installation

1. **Clone the repository** (if not already done)

2. **Navigate to backend directory**
   ```bash
   cd backend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the backend directory:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/roomsearch
   ```
   
   For MongoDB Atlas (cloud):
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/roomsearch?retryWrites=true&w=majority
   ```

5. **Start MongoDB** (if using local MongoDB)
   ```bash
   # macOS with Homebrew
   brew services start mongodb-community
   
   # Or run manually
   mongod
   ```

6. **Run the server**
   
   Development mode (with auto-reload):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Base URL
```
http://localhost:5000
```

### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "RoomSearch API is running",
  "timestamp": "2026-02-09T08:27:32.000Z"
}
```

---

### 2. Create Room Swap Listing
```http
POST /api/users
```

**Request Body:**
```json
{
  "email": "student@bu.edu",
  "name": "John Doe",
  "phoneNo": "1234567890",
  "currentHostelBlock": "c1",
  "currentFloor": "3",
  "desiredHostelBlock": "c2",
  "desiredFloor": "5"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Room swap listing created successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "email": "student@bu.edu",
    "name": "John Doe",
    "phoneNo": "1234567890",
    "currentHostelBlock": "c1",
    "currentFloor": "3",
    "desiredHostelBlock": "c2",
    "desiredFloor": "5",
    "isActive": true,
    "createdAt": "2026-02-09T08:27:32.000Z",
    "updatedAt": "2026-02-09T08:27:32.000Z"
  }
}
```

---

### 3. Get All Listings
```http
GET /api/users
```

**Query Parameters (optional):**
- `block` - Filter by desired hostel block (e.g., `c1`, `d2`)
- `floor` - Filter by desired floor (e.g., `3`, `5`)

**Examples:**
```http
GET /api/users
GET /api/users?block=c1
GET /api/users?block=c2&floor=5
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "email": "student1@bu.edu",
      "name": "John Doe",
      "phoneNo": "1234567890",
      "currentHostelBlock": "c1",
      "currentFloor": "3",
      "desiredHostelBlock": "c2",
      "desiredFloor": "5",
      "isActive": true,
      "createdAt": "2026-02-09T08:27:32.000Z"
    },
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "email": "student2@bu.edu",
      "name": "Jane Smith",
      "phoneNo": "0987654321",
      "currentHostelBlock": "c2",
      "currentFloor": "5",
      "desiredHostelBlock": "c1",
      "desiredFloor": "3",
      "isActive": true,
      "createdAt": "2026-02-09T08:30:00.000Z"
    }
  ]
}
```

---

### 4. Get Single Listing
```http
GET /api/users/:id
```

**Example:**
```http
GET /api/users/65f1a2b3c4d5e6f7g8h9i0j1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "email": "student@bu.edu",
    "name": "John Doe",
    "phoneNo": "1234567890",
    "currentHostelBlock": "c1",
    "currentFloor": "3",
    "desiredHostelBlock": "c2",
    "desiredFloor": "5",
    "isActive": true,
    "createdAt": "2026-02-09T08:27:32.000Z"
  }
}
```

---

### 5. Find Perfect Matches for a User
```http
GET /api/users/matches/:userId
```

This endpoint finds users who:
- Currently have what you want (your desired location)
- Want what you currently have (your current location)

**Example:**
```http
GET /api/users/matches/65f1a2b3c4d5e6f7g8h9i0j1
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "email": "student2@bu.edu",
      "name": "Jane Smith",
      "phoneNo": "0987654321",
      "currentHostelBlock": "c2",
      "currentFloor": "5",
      "desiredHostelBlock": "c1",
      "desiredFloor": "3",
      "isActive": true
    }
  ]
}
```

---

### 6. Search for Potential Matches
```http
GET /api/users/search/potential-matches
```

**Query Parameters (required):**
- `currentBlock` - Your current hostel block
- `currentFloor` - Your current floor
- `desiredBlock` - Your desired hostel block
- `desiredFloor` - Your desired floor

**Example:**
```http
GET /api/users/search/potential-matches?currentBlock=c1&currentFloor=3&desiredBlock=c2&desiredFloor=5
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "email": "student2@bu.edu",
      "name": "Jane Smith",
      "phoneNo": "0987654321",
      "currentHostelBlock": "c2",
      "currentFloor": "5",
      "desiredHostelBlock": "c1",
      "desiredFloor": "3",
      "isActive": true
    }
  ]
}
```

---

### 7. Update Listing
```http
PUT /api/users/:id
```

**Request Body (all fields optional):**
```json
{
  "name": "John Updated",
  "phoneNo": "9999999999",
  "currentHostelBlock": "c3",
  "currentFloor": "4",
  "desiredHostelBlock": "c4",
  "desiredFloor": "6",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "User listing updated successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "email": "student@bu.edu",
    "name": "John Updated",
    "phoneNo": "9999999999",
    "currentHostelBlock": "c3",
    "currentFloor": "4",
    "desiredHostelBlock": "c4",
    "desiredFloor": "6",
    "isActive": true,
    "updatedAt": "2026-02-09T09:00:00.000Z"
  }
}
```

---

### 8. Delete Listing (Soft Delete)
```http
DELETE /api/users/:id
```

**Example:**
```http
DELETE /api/users/65f1a2b3c4d5e6f7g8h9i0j1
```

**Response:**
```json
{
  "success": true,
  "message": "User listing deleted successfully"
}
```

---

## Data Model

### User Schema
```javascript
{
  email: String (required, lowercase, trimmed),
  name: String (required, trimmed),
  phoneNo: String (required, trimmed),
  currentHostelBlock: String (required, lowercase, trimmed),
  currentFloor: String (required, trimmed),
  desiredHostelBlock: String (required, lowercase, trimmed),
  desiredFloor: String (required, trimmed),
  isActive: Boolean (default: true),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Server Error

## Testing with cURL

### Create a listing
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@bu.edu",
    "name": "Test User",
    "phoneNo": "1234567890",
    "currentHostelBlock": "c1",
    "currentFloor": "3",
    "desiredHostelBlock": "c2",
    "desiredFloor": "5"
  }'
```

### Get all listings
```bash
curl http://localhost:5000/api/users
```

### Filter by block
```bash
curl "http://localhost:5000/api/users?block=c1"
```

## Testing with Postman

1. Import the API endpoints into Postman
2. Set base URL: `http://localhost:5000`
3. For POST/PUT requests, set header: `Content-Type: application/json`
4. Use the request body examples provided above

## Deployment

### Deploy to Render, Railway, or Heroku

1. **Create a MongoDB Atlas cluster** (free tier available)
   - Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a cluster and get your connection string

2. **Set environment variables** on your hosting platform:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   PORT=5000
   NODE_ENV=production
   ```

3. **Deploy** using your platform's deployment method

### Update Android App

Update the base URL in your Android app:
```kotlin
// RetrofitInstance.kt
private const val BASE_URL = "https://your-backend-url.com/"
```

## Project Structure

```
backend/
├── config/
│   └── db.js              # Database connection
├── models/
│   └── User.js            # User/Listing schema
├── routes/
│   └── users.js           # API routes
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore file
├── package.json          # Dependencies and scripts
├── server.js             # Main application file
└── README.md             # This file
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

ISC
