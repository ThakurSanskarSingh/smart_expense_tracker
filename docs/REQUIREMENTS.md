# Smart Expense Tracker - Requirements & Scope

**Project**: Smart Expense Tracker  
**Institution**: KIET Group of Institutions, Dept. of Information Technology, Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow  
**Team**: Group No. 41  

---

## 1. Project Overview
Smart Expense Tracker is a responsive, full-stack, cloud-ready financial tracking application designed for individuals looking to monitor personal expenditures, manage category-level budgets, discover automated financial insights, and schedule recurring expenses.

---

## 2. Functional Requirements

### 2.1 Authentication & User Management
- **FR-1.1**: Email & password authentication with Firebase Auth.
- **FR-1.2**: One-click Google OAuth authentication via Firebase.
- **FR-1.3**: Automatic backend profile synchronization (`/auth/sync`) to upsert user profiles in MongoDB.
- **FR-1.4**: Default expense category seeding (Food, Transport, Shopping, Bills, Rent, Health, Education, Entertainment, Travel, Other) upon initial synchronization.
- **FR-1.5**: Profile customization supporting preferred currency symbol/code (INR, USD, EUR, GBP, JPY, etc.) and color theme preference (Light / Dark).

### 2.2 Category Management
- **FR-2.1**: System defaults are protected from accidental hard-deletion.
- **FR-2.2**: Users can create custom categories with tailored names, hex colors, and icon identifiers.
- **FR-2.3**: Category names must be unique per user.
- **FR-2.4**: Safe deletion: Deleting a custom category with active expense records reassigns all affected expenses to the default "Other" category.

### 2.3 Expense Management
- **FR-3.1**: Log expenses with positive amounts, category reference, transaction date, payment method (`cash`, `card`, `upi`, `netbanking`, `other`), short description, and optional notes.
- **FR-3.2**: Filter expenses dynamically by date range (`from`, `to`), category, payment method, amount range (`minAmount`, `maxAmount`), and text search (`q`).
- **FR-3.3**: Server-side pagination and multi-field sorting.
- **FR-3.4**: Export filtered expense records as streaming CSV format.
- **FR-3.5**: Full CRUD operations with instant budget recalculation.

### 2.4 Budgets & Proactive Threshold Alerts
- **FR-4.1**: Set monthly spending limits per category or globally (overall monthly cap) for a given `YYYY-MM`.
- **FR-4.2**: Real-time spending calculation comparing accumulated monthly expenses against budget limits.
- **FR-4.3**: Automated alert triggers:
  - Warning notification triggered when expenditures reach or exceed alert threshold (default 80%).
  - Exceeded notification triggered when expenditures reach or exceed 100%.
  - Deduplicated notifications: exactly one notification per budget, month, and severity level.

### 2.5 Recurring Expense Automation
- **FR-5.1**: Mark expenses as recurring with frequency: `daily`, `weekly`, `monthly`, or `yearly`.
- **FR-5.2**: Automated daily background job (00:05 system time) checks for due items, posts the new expense, computes the subsequent `nextDue` date, and notifies the user (`recurring_added`).

### 2.6 Analytics & Reports
- **FR-6.1**: Monthly summary KPI metrics: total spending, expense count, average daily spending, percentage change vs previous month, and top spending category.
- **FR-6.2**: Category-wise expenditure breakdown (doughnut visualization).
- **FR-6.3**: 12-month annual trend comparison (bar chart).
- **FR-6.4**: Daily spending trend within chosen month (line chart).
- **FR-6.5**: Budget vs. Actual side-by-side grouped analysis.

### 2.7 AI-Powered & Rule-Based Smart Insights
- **FR-7.1**: Real-time rule evaluation:
  - Category dominance (>40% of monthly budget/spending).
  - Rapid month-over-month surge (>20% growth).
  - Active budget breaches.
  - Zero-spend streak recognition.
  - High recurring commitment ratio (>30% of total expenditure).
- **FR-7.2**: LLM provider integration (Gemini / OpenAI) with strictly validated JSON responses and structured prompt sanitization.
- **FR-7.3**: Resilient graceful degradation: fallback to rule-based insights if AI fails, times out (8 seconds), or no API key is configured.

### 2.8 Notifications
- **FR-8.1**: Real-time notification badge with unread count indicator.
- **FR-8.2**: Read / unread toggle and bulk mark-all-read endpoint.

---

## 3. Non-Functional Requirements
- **NFR-1 (Security)**: Defense-in-depth with Helmet security headers, CORS origin enforcement, rate-limiting (100 requests per 15 minutes), MongoDB query sanitization, and strict input validation via Zod.
- **NFR-2 (Multi-tenancy & Isolation)**: Every single read/write database query must be strictly scoped to `req.user.id`.
- **NFR-3 (Performance)**: Lean payloads, index-backed MongoDB queries (`{ user: 1, date: -1 }`), and streaming CSV generation.
- **NFR-4 (Accessibility & Responsiveness)**: Mobile-first responsive layout (collapsing sidebar to mobile bottom navigation under 768px), high-contrast accessible forms, and native dark mode.

---

## 4. User Stories
1. **As a student/professional**, I want to sign in securely with my Google account so that I don't need to remember another set of credentials.
2. **As a budget-conscious user**, I want to set a ₹10,000 monthly food limit and receive a warning before I exceed it so that I can control dining out costs.
3. **As a commuter**, I want to quickly add daily metro and cab expenses via UPI on my phone so that my records remain accurate.
4. **As an analyst**, I want to export my filtered expense history to CSV so that I can inspect or audit it in spreadsheet tools.
5. **As a user planning savings**, I want AI-driven tips on spending anomalies and recurring subscriptions so that I can cut unnecessary expenses.
