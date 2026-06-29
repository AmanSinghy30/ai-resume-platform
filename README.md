<div align="center">
  
  # 🚀 ResumeScreen
  **Screen resumes 10x faster with AI-powered parsing, ranking, and analytics.**

  [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
  [![n8n](https://img.shields.io/badge/n8n-FF6C37?style=for-the-badge&logo=n8n&logoColor=white)](https://n8n.io/)

  <br />
  
  <!-- Replace with your actual hero image path -->
  <img src="docs/assets/dashboard.png" alt="ResumeScreen Dashboard" width="800"/>

</div>

---

## 📖 Overview

**ResumeScreen** is a modern, intelligent candidate management platform designed to automate the most tedious parts of the hiring process. By leveraging the power of **Google Gemini AI** and **n8n automation workflows**, ResumeScreen automatically extracts data from uploaded PDFs, evaluates candidates against job requirements, generates deep analytical insights, and even handles automated email outreach—allowing HR teams to focus on interviewing rather than reading PDFs.

## ✨ Key Features

- 🧠 **AI-Powered Parsing:** Drag and drop PDF resumes to automatically extract Name, Email, Phone, and Skills using Gemini AI.
- 🎯 **Deep Candidate Analysis:** Go beyond simple scores. Our AI generates comprehensive Candidate Detail pages highlighting core **Strengths**, **Areas of Concern**, matched skills, and missing requirements.
- 📨 **Automated Email Workflows (via n8n):** Visual automation pipelines automatically trigger conditional logic to send customized acceptance or rejection emails via Gmail based on the AI's final status.
- 💼 **Job & Position Management:** Create and manage active job listings, each with customized skill requirements and descriptions.
- 📊 **Beautiful Dashboard & Analytics:** A sleek, responsive dashboard providing at-a-glance metrics (Total Candidates, Shortlisted, Pending Review, Active Jobs).
- ⚡ **Advanced Filtering & CSV Export:** Filter your talent pool by status, specific skills, or minimum experience, then auto-shortlist and export to CSV.
- 🔄 **Real-Time Activity Logs:** Powered by MongoDB Change Streams, every action (uploads, AI scoring, deletions) is tracked and logged automatically in the Activity feed.
- 🌓 **Dark/Light Mode Support:** A premium UI that persists your viewing preferences.

## 📸 Screenshots

<details>
<summary>Click to view UI Screenshots</summary>

| Dashboard | Job Management |
| :---: | :---: |
| <img src="docs/assets/dashboard.png" width="400"/> | <img src="docs/assets/jobs.png" width="400"/> |

| Detailed AI Analysis | Candidate Filtering |
| :---: | :---: |
| <img src="docs/assets/candidate-detail.png" width="400"/> | <img src="docs/assets/filtering.png" width="400"/> |

| PDF Upload & Auto-fill | Shortlisted & Export |
| :---: | :---: |
| <img src="docs/assets/upload.png" width="400"/> | <img src="docs/assets/shortlisted.png" width="400"/> |

| Candidate Rankings | Real-Time Activity Log |
| :---: | :---: |
| <img src="docs/assets/rankings.png" width="400"/> | <img src="docs/assets/activity.png" width="400"/> |

| **n8n Webhook & Email Automation Flow** |
| :---: |
| [📥 Download Job Matching Workflow JSON](./Job%20Matching%20Workflow%20(1).json) |
| <img src="docs/assets/n8n-workflow.png" width="800"/> |

</details>

## 🏗️ Architecture & Tech Stack

### Frontend (Client)
- **React (TypeScript):** Component-based UI with strong typing.
- **Tailwind CSS / Custom CSS:** For the sleek, modern styling and dark mode.
- **React Router:** For seamless single-page application navigation.

### Backend (Server)
- **Node.js & Express:** Robust REST API to handle authentication, uploads, and data retrieval.
- **MongoDB & Mongoose:** NoSQL database with strict schemas. Uses **Change Streams** to watch for document updates and auto-generate activity logs.
- **Multer:** Handles multipart/form-data for PDF file uploads.

### AI & Automation
- **Google Generative AI (Gemini):** Processes extracted raw text to generate JSON candidate profiles, strengths, and weaknesses.
- **n8n:** External webhook integration for complex asynchronous workflow processing. Our custom flow fetches candidate data, handles logical routing (shortlist vs reject), updates the database, and dispatches automated Gmail responses.

## 📂 Project Structure

```text
ai-resume-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Global state management
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Application views (Dashboard, Jobs, etc.)
│   │   └── services/       # API integration & network calls
│
├── server/                 # Node.js/Express backend
│   ├── controllers/        # Route controllers (business logic)
│   ├── middleware/         # Express middleware (auth, upload, etc.)
│   ├── models/             # Mongoose database schemas
│   ├── routes/             # Express API routes
│   ├── scripts/            # Utility/migration scripts
│   ├── uploads/            # Temporary storage for PDF resumes
│   └── utils/              # Helper functions (PDF parser, AI client)
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Must be configured as a Replica Set to enable Change Streams)
- A Google Gemini API Key
- [n8n](https://n8n.io/) (Self-hosted or Cloud)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/ai-resume-platform.git
cd ai-resume-platform
```

### 2. Setup the Backend
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/resume-platform?replicaSet=rs0
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
N8N_BASE_URL=http://localhost:5678
N8N_ENABLED=true
```
Start the backend server:
```bash
npm run dev
```

### 3. Setup the Frontend
```bash
cd ../client
npm install
```
The React app will automatically default to connecting to `http://localhost:5000/api` locally, so no `.env` file is required.

Start the React app:
```bash
npm start
```

## 🧠 How the AI Workflow Operates
1. **Upload:** User drags & drops a PDF resume in the UI.
2. **Parse:** Express backend receives the file via `multer` and extracts raw text using `pdf-parse`.
3. **Trigger:** The raw text is passed to Gemini / n8n via webhook for analysis.
4. **Evaluate:** The AI maps the text against the selected Job requirements, generating a score, strengths, areas of concern, and a list of identified skills.
5. **Automate:** The n8n workflow branches conditionally based on the AI's status decision, automatically sending a personalized acceptance or rejection email via Gmail.
6. **Log:** MongoDB Change Streams detect the updated candidate document and automatically push a log to the Activity feed.

## 👤 Author
**Aman Kumar Singh**

## 📝 License
This project is being developed for learning and portfolio purposes.
