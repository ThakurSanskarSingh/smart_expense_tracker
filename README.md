# Smart Expense Tracker

[![CI Workflow](https://github.com/group41-kiet/smart-expense-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/group41-kiet/smart-expense-tracker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)

A production-grade, full-stack Personal Expense & Budget Management system with automated financial insights, proactive threshold notifications, and recurring expense automation.

> **Academic Project Submission**  
> **Group No. 41**  
> Department of Information Technology  
> **KIET Group of Institutions**, Ghaziabad  
> Affiliated to **Dr. A.P.J. Abdul Kalam Technical University (AKTU)**, Lucknow

---

## 🌟 Key Features

1. **Authentication & Multi-Tenancy**:
   - Secure Firebase Authentication (Email/Password & Google Sign-in).
   - Strict multi-tenant data segregation with user-scoped queries.
   - Automatic user profile sync with 10 default seeded categories.
2. **Category & Expense Management**:
   - Granular CRUD on expenses with tags, payment methods (`cash`, `card`, `upi`, `netbanking`, `other`), and notes.
   - Protected system categories with safe deletion (reassigns orphaned records to "Other").
   - Multi-criteria filtering, search, pagination, and streaming CSV export.
3. **Proactive Budgeting & Alerts**:
   - Monthly category-level and overall spending caps (`YYYY-MM`).
   - Automated threshold evaluations at 80% (`budget_warning`) and 100% (`budget_exceeded`).
   - Deduplicated notifications per month and threshold level.
4. **Smart Insights Engine**:
   - Dual-engine architecture: AI LLM (Gemini / OpenAI) with deterministic rules-engine fallback.
   - Anomaly detection: category dominance (>40%), rapid month-over-month surge (>20%), zero-spend days, and subscription burden.
5. **Recurring Expense Scheduler**:
   - Automated background daemon (`node-cron` daily at 00:05) creates due recurring transactions and advances next due dates.
6. **Mobile-First Responsive Dashboard**:
   - High-contrast accessible UI with dark mode support.
   - Chart.js visual analytics: category doughnut, monthly 12-month bar chart, daily spending line chart, and budget vs actual comparison.

---

## 🏗️ Architecture & Tech Stack

- **Client**: React 18, Vite, React Router 6, Chart.js + react-chartjs-2, Axios, Firebase JS SDK, plain CSS custom properties (no heavy component library overhead).
- **Server**: Node.js 20, Express 4, Mongoose 8 (MongoDB), Firebase Admin SDK, Zod, Helmet, CORS, Express Rate Limit, Express Mongo Sanitize, Node-Cron, Morgan, Dotenv.
- **Testing**: Jest + Supertest + MongoDB Memory Server (Backend); Vitest + React Testing Library + JSDOM (Frontend).
- **Code Quality**: ESLint + Prettier.

---

## 🚀 Quickstart Guide (5 Steps)

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher
- Running MongoDB instance (local or MongoDB Atlas connection string)
- Firebase Project with Auth enabled (Email/Password & Google)

### 1. Clone the repository
```bash
git clone https://github.com/group41-kiet/smart-expense-tracker.git
cd smart-expense-tracker
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in both `client/` and `server/`:
```bash
# Server configuration
cp server/.env.example server/.env

# Client configuration
cp client/.env.example client/.env
```

### 3. Install Dependencies
```bash
cd server && npm install
cd ../client && npm install
cd ..
```

### 4. Seed Demo Data (Optional)
Populate the database with 6 months of demo expenses, categories, budgets, and recurring items:
```bash
npm run seed
```

### 5. Run Development Servers
In two separate terminal tabs:
```bash
# Terminal 1: Backend API (port 5000)
npm run dev:server

# Terminal 2: Frontend SPA (port 5173)
npm run dev:client
```
Open `http://localhost:5173` in your browser.

---

## 📜 Available Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev:server` | Starts Express API with hot-reload via nodemon |
| `npm run dev:client` | Starts Vite frontend dev server |
| `npm test` | Runs Jest backend test suite and Vitest frontend test suite |
| `npm run test:server` | Runs backend unit & integration tests with in-memory MongoDB |
| `npm run test:client` | Runs frontend unit and component tests with Vitest |
| `npm run lint` | Runs ESLint across both server and client |
| `npm run seed` | Seeds database with 6 months of realistic historical data |

---

## 🔒 Security Posture

- **Rate Limiting**: 100 requests per 15-minute window per IP.
- **SQL / NoSQL Sanitization**: `express-mongo-sanitize` strips operator keys (`$`, `.`) from requests.
- **Security Headers**: `helmet` enforces strict CSP, HSTS, and X-Content-Type-Options.
- **CORS Restrictive Policy**: Strict origin matching matching `CLIENT_ORIGIN`.
- **Identity Assurance**: Firebase Admin verifies RS256 JWT signatures on all protected `/api/*` endpoints.

---

## 👥 Project Credits

**Group No. 41**, Department of Information Technology  
**KIET Group of Institutions**, Ghaziabad, UP, India  
Affiliated with Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow
