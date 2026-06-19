# AI Resume Screening Platform

## Overview

AI Resume Screening Platform is a full-stack web application that helps recruiters manage job applications, upload resumes, extract candidate information, and streamline the hiring process.

The platform automates resume processing by extracting candidate details such as skills, experience, and education from uploaded PDF resumes.

## 🚀 Live Demo

**Frontend:** https://ai-resume-platform-puce.vercel.app/
**Backend API:** https://ai-resume-platform-v5jz.onrender.com

## Test Credentials
Email:test@gmail.com
Password: 123456
---

## Features Implemented

### Authentication

* Recruiter Registration
* Recruiter Login
* JWT Authentication
* Protected Routes

### Resume Management

* PDF Resume Upload
* Resume Storage
* Candidate Profile Creation
* Candidate CRUD Operations

### Resume Parsing

* Automatic PDF Text Extraction
* Skills Extraction
* Experience Extraction

### Dashboard

* Real-time Candidate Statistics
* Recent Candidates Display
* Activity Tracking

### Validation

* Frontend Form Validation
* Backend Validation
* Error Handling
* Toast Notifications

---

## Tech Stack

### Frontend

* React.js
* TypeScript
* Tailwind CSS
* React Router
* Axios

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### Authentication

* JWT
* bcryptjs

### File Processing

* Multer
* pdf-parse

---

## Project Structure

```text
ai-resume-platform/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── utils/
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── utils/
│
└── README.md
```

---

## Setup Instructions

### Clone Repository

```bash
git clone <repository-url>
cd ai-resume-platform
```

### Frontend Setup

```bash
cd client
npm install
npm start
```

### Backend Setup

```bash
cd server
npm install
npm run dev
```

### Environment Variables

Create a `.env` file inside the server folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---
---

## Author

Aman Kumar Singh

## License

This project is being developed for learning and portfolio purposes.
