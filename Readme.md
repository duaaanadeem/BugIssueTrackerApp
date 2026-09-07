# Bug Issue Tracker App

A full-stack Bug Issue Tracker application built with a Node.js/Express backend, MongoDB database, and React Native/Expo mobile frontend.

## Features

* User signup and login
* JWT-based authentication
* User roles
* Project management
* Issue creation and management
* Issue comments
* Issue history
* User profiles
* React Native mobile application
* REST API
* MongoDB database
* Deployed backend on Render
* Web deployment using Vercel

## Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs
* CORS
* dotenv
* Multer

### Mobile

* React Native
* Expo
* React Navigation
* AsyncStorage
* Expo Image Picker

## Project Structure

```text
BugIssueTrackerApp/
├── Backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authcontroller.js
│   │   ├── issuecontroller.js
│   │   └── projectcontroller.js
│   ├── middleware/
│   │   ├── authmiddleware.js
│   │   └── errormiddleware.js
│   ├── models/
│   │   ├── comment.js
│   │   ├── issue.js
│   │   ├── issuehistory.js
│   │   ├── project.js
│   │   └── user.js
│   ├── routes/
│   │   ├── authroutes.js
│   │   ├── issueroutes.js
│   │   └── projectroutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── Mobile/
│   ├── src/
│   │   ├── components/
│   │   ├── constants/
│   │   │   └── api.js
│   │   ├── context/
│   │   │   └── authcontext.js
│   │   ├── navigation/
│   │   │   └── appnavigator.js
│   │   ├── screens/
│   │   ├── services/
│   │   │   └── api.js
│   │   └── utils/
│   │       └── storage.js
│   ├── App.js
│   ├── app.json
│   ├── index.js
│   ├── package.json
│   └── vercel.json
│
├── .gitignore
└── Readme.md
```

## Requirements

Before running the project, install:

* Node.js
* npm
* MongoDB or a MongoDB Atlas database
* Expo CLI / Expo development environment

## Backend Setup

Navigate to the Backend folder:

```bash
cd Backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside `Backend`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend:

```bash
npm start
```

For development with Nodemon:

```bash
npm run dev
```

The backend API will run locally at:

```text
http://localhost:5000
```

## Mobile Setup

Open another terminal and navigate to the Mobile folder:

```bash
cd Mobile
```

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npx expo start
```

For web:

```bash
npx expo start --web
```

The mobile application uses the API URL configured in:

```text
Mobile/src/constants/api.js
```

Current deployed backend:

```text
https://bugissuetrackerappp.onrender.com/api
```

## API Details

### Base URL

```text
https://bugissuetrackerappp.onrender.com/api
```

### Authentication

#### Signup

```http
POST /auth/signup
```

Example request:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login

```http
POST /auth/login
```

Example request:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

The login response provides a JWT token used for authenticated requests.

#### Get Users

```http
GET /auth/users
```

### Projects

#### Get Projects

```http
GET /projects
```

#### Create Project

```http
POST /projects
```

Example:

```json
{
  "name": "Bug Tracker",
  "description": "Project for tracking application issues"
}
```

#### Get Project

```http
GET /projects/:id
```

#### Update Project

```http
PUT /projects/:id
```

#### Delete Project

```http
DELETE /projects/:id
```

### Issues

#### Get Issues

```http
GET /issues
```

#### Create Issue

```http
POST /issues
```

Example:

```json
{
  "title": "Login button not working",
  "description": "The login button does not submit the form.",
  "project": "PROJECT_ID"
}
```

#### Get Issue

```http
GET /issues/:id
```

#### Update Issue

```http
PUT /issues/:id
```

#### Delete Issue

```http
DELETE /issues/:id
```

### Comments

Add a comment to an issue:

```http
POST /issues/:id/comments
```

Example:

```json
{
  "text": "This issue needs to be investigated."
}
```

### Issue History

Get the history of an issue:

```http
GET /issues/:id/history
```

## Authentication

Protected API endpoints require a JWT token.

Include the token in the request header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Example:

```text
Authorization: Bearer eyJhbGciOi...
```

## Error Handling

The backend returns JSON responses containing information about the request status and errors.

Example:

```json
{
  "message": "Invalid credentials"
}
```

## Deployment

### Backend

The backend is deployed on Render.

API:

```text
https://bugissuetrackerappp.onrender.com
```

### Frontend

The Expo web application is deployed on Vercel.

```text
https://bug-issue-tracker-app.vercel.app
```

## Security

Do not commit sensitive information such as:

* MongoDB connection strings
* JWT secrets
* API keys
* `.env` files

Make sure `.env` files are included in `.gitignore`.

## Author

Duaa Nadeem
