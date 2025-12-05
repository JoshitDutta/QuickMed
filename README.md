# QuickMed Pharmacy Management System

A comprehensive MERN stack application for managing pharmacy inventory, sales, suppliers, and billing.

## Features
- **Dashboard**: Real-time sales stats, low stock alerts, expiring items.
- **Inventory**: Advanced filtering, sorting, expired/low stock tracking.
- **Suppliers**: Manage supplier directory.
- **Orders & Billing**: Process sales and generate reports (In Progress).
- **Authentication**: Secure JWT-based auth with role management.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS v4, Axios, React Router.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Security**: Helmet, Rate Limiting, JWT, Bcrypt.

## Setup & Deployment

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### Local Development

1.  **Clone Request**
    ```bash
    git clone <repo-url>
    cd quickmed-project
    ```

2.  **Backend Setup**
    ```bash
    npm install
    cp .env.example .env
    # Edit .env with your config
    npm run dev
    ```

3.  **Frontend Setup**
    ```bash
    cd client
    npm install
    npm run dev
    ```

### Production Deployment

#### Backend (Render/Heroku/Railway)
1.  Set environment variables on the host (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`).
2.  Deploy the root directory.
3.  Start command: `npm start`.

#### Frontend (Vercel/Netlify)
1.  Set build command: `npm run build`.
2.  Set output directory: `dist`.
3.  Set environment variable `VITE_API_URL` to your backend URL.

## API Documentation
Base URL: `/api`

- **Auth**: `/auth/register`, `/auth/login`
- **Medicines**: `/medicines` (GET, POST, PUT, DELETE)
- **Suppliers**: `/suppliers`
- **Dashboard**: `/dashboard/stats`
