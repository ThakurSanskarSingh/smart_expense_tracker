# Smart Expense Tracker - API Contract & Documentation

**Group No. 41** | Department of Information Technology, KIET Group of Institutions (AKTU)

Base URL: `/api`  
Authentication: HTTP Bearer Token (`Authorization: Bearer <FIREBASE_ID_TOKEN>`) required for all endpoints except `/health`.

Standard Response Formats:
- **Success**: `{ "success": true, "data": <payload> }`
- **Error**: `{ "success": false, "error": { "code": "<ERROR_CODE>", "message": "<Human message>" } }`

---

## 1. System & Authentication Endpoints

### 1.1 Health Check
- **Method**: `GET /api/health`
- **Auth**: None
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": {
      "status": "UP",
      "timestamp": "2026-11-17T12:00:00.000Z",
      "uptime": 123.45
    }
  }
  ```

### 1.2 Auth Sync (Upsert User & Seed Categories)
- **Method**: `POST /api/auth/sync`
- **Auth**: Required
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "6739de...",
        "uid": "firebase-uid-123",
        "email": "user@kiet.edu",
        "name": "Group 41 User",
        "currency": "INR",
        "theme": "dark"
      },
      "isNewUser": true
    }
  }
  ```

### 1.3 Get Current User Profile
- **Method**: `GET /api/users/me`
- **Auth**: Required
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "6739de...",
      "uid": "firebase-uid-123",
      "email": "user@kiet.edu",
      "name": "Group 41 User",
      "currency": "INR",
      "theme": "dark"
    }
  }
  ```

### 1.4 Update Current User Profile
- **Method**: `PUT /api/users/me`
- **Auth**: Required
- **Body**:
  ```json
  {
    "name": "Group 41 Lead",
    "currency": "USD",
    "theme": "light"
  }
  ```
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "6739de...",
      "name": "Group 41 Lead",
      "currency": "USD",
      "theme": "light"
    }
  }
  ```

---

## 2. Category Endpoints

### 2.1 List Categories
- **Method**: `GET /api/categories`
- **Auth**: Required
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "6739f...",
        "name": "Food",
        "color": "#FF5722",
        "icon": "utensils",
        "isDefault": true
      }
    ]
  }
  ```

### 2.2 Create Category
- **Method**: `POST /api/categories`
- **Auth**: Required
- **Body**:
  ```json
  {
    "name": "Fitness & Gym",
    "color": "#4CAF50",
    "icon": "dumbbell"
  }
  ```
- **Response `201`**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "673a0...",
      "name": "Fitness & Gym",
      "color": "#4CAF50",
      "icon": "dumbbell",
      "isDefault": false
    }
  }
  ```

### 2.3 Update Category
- **Method**: `PUT /api/categories/:id`
- **Auth**: Required
- **Body**:
  ```json
  {
    "name": "Gym & Health",
    "color": "#388E3C",
    "icon": "activity"
  }
  ```
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "673a0...",
      "name": "Gym & Health",
      "color": "#388E3C",
      "icon": "activity"
    }
  }
  ```

### 2.4 Delete Category
- **Method**: `DELETE /api/categories/:id`
- **Auth**: Required
- **Behavior**: Default categories cannot be deleted (`403 Forbidden`). Deleting a custom category reassigns its expenses to default category `"Other"`.
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Category deleted and expenses reassigned to Other"
    }
  }
  ```

---

## 3. Expense Endpoints

### 3.1 List Expenses (With Filters & Pagination)
- **Method**: `GET /api/expenses`
- **Auth**: Required
- **Query Parameters**:
  - `from` (ISO Date string, e.g. `2026-11-01`)
  - `to` (ISO Date string, e.g. `2026-11-30`)
  - `category` (Category ID)
  - `q` (Keyword search across description and notes)
  - `paymentMethod` (`cash` | `card` | `upi` | `netbanking` | `other`)
  - `minAmount` (number)
  - `maxAmount` (number)
  - `sort` (e.g. `-date`, `date`, `-amount`, `amount`)
  - `page` (default `1`)
  - `limit` (default `10`)
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": {
      "expenses": [
        {
          "_id": "673b0...",
          "amount": 450,
          "category": {
            "_id": "6739f...",
            "name": "Food",
            "color": "#FF5722",
            "icon": "utensils"
          },
          "description": "Lunch with team",
          "date": "2026-11-17T12:00:00.000Z",
          "paymentMethod": "upi",
          "notes": "Cafeteria bill",
          "recurring": {
            "enabled": false
          }
        }
      ],
      "pagination": {
        "total": 145,
        "page": 1,
        "limit": 10,
        "pages": 15
      }
    }
  }
  ```

### 3.2 Create Expense
- **Method**: `POST /api/expenses`
- **Auth**: Required
- **Body**:
  ```json
  {
    "amount": 299,
    "categoryId": "6739f...",
    "description": "Streaming subscription",
    "date": "2026-11-17",
    "paymentMethod": "card",
    "notes": "Monthly billing",
    "recurring": {
      "enabled": true,
      "frequency": "monthly",
      "nextDue": "2026-12-17"
    }
  }
  ```
- **Response `201`**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "673b1...",
      "amount": 299,
      "description": "Streaming subscription"
    }
  }
  ```

### 3.3 Get Expense By ID
- **Method**: `GET /api/expenses/:id`
- **Auth**: Required
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "673b1...",
      "amount": 299,
      "category": { "_id": "...", "name": "Entertainment" }
    }
  }
  ```

### 3.4 Update Expense By ID
- **Method**: `PUT /api/expenses/:id`
- **Auth**: Required
- **Body**:
  ```json
  {
    "amount": 349,
    "description": "Updated subscription tier"
  }
  ```
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "673b1...",
      "amount": 349
    }
  }
  ```

### 3.5 Delete Expense By ID
- **Method**: `DELETE /api/expenses/:id`
- **Auth**: Required
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Expense deleted successfully"
    }
  }
  ```

### 3.6 Stream CSV Export
- **Method**: `GET /api/expenses/export.csv`
- **Auth**: Required
- **Query Parameters**: Same filters as `GET /api/expenses`
- **Response Header**: `Content-Type: text/csv`
- **Content-Disposition**: `attachment; filename="expenses-YYYY-MM-DD.csv"`

---

## 4. Budget Endpoints

### 4.1 List Budgets
- **Method**: `GET /api/budgets?month=YYYY-MM`
- **Auth**: Required
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "673c0...",
        "month": "2026-11",
        "category": { "_id": "...", "name": "Food" },
        "limit": 10000,
        "alertThreshold": 80
      }
    ]
  }
  ```

### 4.2 Create or Upsert Budget
- **Method**: `POST /api/budgets`
- **Auth**: Required
- **Body**:
  ```json
  {
    "month": "2026-11",
    "categoryId": "6739f...",
    "limit": 12000,
    "alertThreshold": 80
  }
  ```
  *(Pass `categoryId: null` for overall monthly budget)*
- **Response `201`**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "673c1...",
      "month": "2026-11",
      "limit": 12000
    }
  }
  ```

### 4.3 Update Budget
- **Method**: `PUT /api/budgets/:id`
- **Auth**: Required
- **Body**:
  ```json
  {
    "limit": 15000,
    "alertThreshold": 85
  }
  ```
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "673c1...",
      "limit": 15000
    }
  }
  ```

### 4.4 Delete Budget
- **Method**: `DELETE /api/budgets/:id`
- **Auth**: Required
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": { "message": "Budget deleted successfully" }
  }
  ```

### 4.5 Budget Status (Spent, Percentage, State)
- **Method**: `GET /api/budgets/status?month=YYYY-MM`
- **Auth**: Required
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "budgetId": "673c1...",
        "category": { "_id": "...", "name": "Food" },
        "limit": 10000,
        "spent": 8500,
        "remaining": 1500,
        "percent": 85.0,
        "state": "warning",
        "alertThreshold": 80
      }
    ]
  }
  ```
  *(State: `"ok"` | `"warning"` | `"exceeded"`)*

---

## 5. Analytics Endpoints

### 5.1 Monthly Summary KPI
- **Method**: `GET /api/analytics/summary?month=YYYY-MM`
- **Auth**: Required
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": {
      "month": "2026-11",
      "totalSpent": 34500,
      "expenseCount": 42,
      "avgPerDay": 1150,
      "previousMonthTotal": 31000,
      "changePercentage": 11.29,
      "topCategory": {
        "name": "Food",
        "amount": 12400,
        "percentage": 35.94
      }
    }
  }
  ```

### 5.2 Category Breakdown
- **Method**: `GET /api/analytics/by-category?month=YYYY-MM`
- **Auth**: Required
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "categoryId": "...",
        "name": "Food",
        "color": "#FF5722",
        "total": 12400,
        "count": 18,
        "percentage": 35.94
      }
    ]
  }
  ```

### 5.3 Monthly Trends
- **Method**: `GET /api/analytics/monthly?year=YYYY`
- **Auth**: Required
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": [
      { "month": "2026-01", "total": 28000, "count": 30 },
      { "month": "2026-12", "total": 0, "count": 0 }
    ]
  }
  ```

### 5.4 Yearly Trends
- **Method**: `GET /api/analytics/yearly`
- **Auth**: Required
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": [
      { "year": 2025, "total": 320000, "count": 412 },
      { "year": 2026, "total": 354000, "count": 489 }
    ]
  }
  ```

### 5.5 Budget vs Actual Grouped
- **Method**: `GET /api/analytics/budget-vs-actual?month=YYYY-MM`
- **Auth**: Required
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "categoryId": "...",
        "categoryName": "Food",
        "budget": 10000,
        "actual": 8500,
        "difference": 1500,
        "isOver": false
      }
    ]
  }
  ```

---

## 6. Smart Insights Endpoints

### 6.1 Get AI / Rule Insights
- **Method**: `GET /api/insights?month=YYYY-MM`
- **Auth**: Required
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": {
      "source": "llm",
      "tips": [
        {
          "type": "category_warning",
          "title": "High Food Spending",
          "message": "Food accounts for 42% of total expenses this month.",
          "severity": "warning"
        },
        {
          "type": "saving_opportunity",
          "title": "Subscription Audit",
          "message": "Recurring subscriptions total ₹4,200/mo. Consider canceling unused memberships.",
          "severity": "info"
        }
      ]
    }
  }
  ```

---

## 7. Notification Endpoints

### 7.1 List Notifications
- **Method**: `GET /api/notifications?unread=true`
- **Auth**: Required
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "673d...",
        "type": "budget_warning",
        "message": "Warning: Food budget has reached 85% of limit (₹10,000).",
        "read": false,
        "createdAt": "2026-11-17T11:45:00.000Z"
      }
    ]
  }
  ```

### 7.2 Mark Notification as Read
- **Method**: `PATCH /api/notifications/:id/read`
- **Auth**: Required
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "673d...",
      "read": true
    }
  }
  ```

### 7.3 Mark All Notifications as Read
- **Method**: `PATCH /api/notifications/read-all`
- **Auth**: Required
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": {
      "modifiedCount": 3
    }
  }
  ```
