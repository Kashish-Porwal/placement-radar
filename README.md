# 🎯 Placement Radar — Smart Job Application & AI Interview Tracker

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-3D_Animations-purple)](https://www.framer.com/motion/)

> **Placement Radar** is a next-generation, cyberpunk-styled full-stack web application designed to help job seekers, students, and engineers organize their hiring pipelines, parse resumes with AI, calculate ATS job description match scores, and never miss an interview reminder.

---

## 🌟 Key Features & Storyteller Workflow

### 1. 📋 Interactive 3D Kanban Tracker
- **6 Pipeline Stages:** `Applied`, `OA / Screening`, `Interview R1`, `Interview R2`, `Offer`, and `Rejected`.
- **Drag & Drop Physics:** Built with `@dnd-kit/core` for ultra-smooth drag interactions with 3D card tilt and neon lighting.
- **🥳 Confetti Burst Celebration:** Dragging any job card into the **Offer** column triggers a festive multi-shot 3D confetti explosion!

---

### 2. ⚡ AI Job Description Match & Resume Tailoring
> 💡 **IMPORTANT USAGE NOTE FOR ALL USERS:**
> 1. **Upload Base Resume First:** Navigate to the **Resumes** tab and upload your primary PDF/DOCX resume so the AI engine knows your background skills.
> 2. **Analyze Match Score:** Click **`⚡ Paste JD & AI`** on any job application card, paste the job description text, and click **`Analyze Match Score`**.
> 3. **View Insights:** The AI scans the JD against your base resume to generate an instant **ATS Match Score Ring (%)**, **Matched/Extracted Skills**, and **Missing Skills**.

---

### 3. 📅 Smart Interview Scheduler & 24h Reminders
- **Triggered on Demand:** Prompts for interview Date & Time *only* when dragging a job card into `Interview R1` or `Interview R2`.
- **Scoped Green Badges:** The green `📅 [Date]` badge displays *strictly* while the job card is in an interview column, and automatically resets when moved to non-interview stages.
- **Automated Notifications:** Sends automated 24-hour advance email reminders and topbar notifications via Node.js cron jobs.

---

### 4. 📊 Analytics & Progress Velocity
- **Conversion Metrics:** Track your interview rate, offer conversion rate, and total active applications.
- **Visual Charts:** Interactive Recharts graphs showing application velocity and platform breakdown (LinkedIn, Naukri, Wellfound, Internshala).

---

### 5. 🔐 Security & User Authentication
- **Dynamic User Profiles:** Displays each logged-in user's personalized name and avatar initials dynamically across the dashboard.
- **JWT & Bcrypt Hashing:** Secure token-based session auth and salted password hashing.
- **2FA & Password Management:** Change password and toggle Two-Factor Authentication directly from Settings.

---

### 📱 6. 100% Mobile Responsive & Touch-Optimized
- **Mobile Glassmorphism Bottom Nav:** Floating bottom navigation bar for small screens.
- **Stage Selector Pills:** Tap stage pills (`Applied`, `Interview`, `Offer`) to instantly filter columns or swipe snap across columns on mobile phones.

---

## 🏗️ Tech Stack

| Tier | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion, `@dnd-kit`, Lucide Icons, Canvas Confetti, Recharts |
| **Backend** | Node.js, Express.js, JWT (`jsonwebtoken`), `bcryptjs`, `nodemailer`, `node-cron` |
| **Database** | MongoDB Atlas (Cloud) / Local MongoDB via Mongoose |
| **AI Processing**| OpenAI GPT-4o-mini / Dynamic Fallback Engine |

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or MongoDB Atlas Cluster)

### 1. Clone the Repository
```bash
git clone https://github.com/Kashish-Porwal/placement-radar.git
cd placement-radar
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:
```env
PORT=5005
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/placement-radar?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key_optional
```

Start the Backend Server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser!

---

## 🌐 Live Deployment

- **Frontend (Vercel):** [https://placement-radar.vercel.app](https://placement-radar.vercel.app)
- **Backend (Render):** [https://placement-radar.onrender.com](https://placement-radar.onrender.com)

---

## 🛡️ License

Distributed under the MIT License. Built with ❤️ for job seekers everywhere.
