# Support Ticket System

A simple, clean, and functional Support Ticket System built with MERN stack (MongoDB, Express, React, Node.js).

## Features
- **Authentication**: JWT-based login and registration with Role-Based Access Control (User/Admin).
- **Ticket Management**: Users can create, view, and track tickets.
- **Admin Panel**: Admins can manage all tickets, update statuses, and reply.
- **Analytics Dashboard**: Visual representation of ticket statistics using charts.
- **Responsive UI**: Modern and clean interface built with React and CSS.

## Tech Stack
- **Frontend**: React, React Router, Axios, Lucide React (icons), Recharts (analytics).
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, Bcrypt.js.

## Prerequisites
- Node.js installed
- MongoDB installed and running locally

## Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd SupTicket
```

### 2. Setup Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/supticket
JWT_SECRET=your_secret_key
NODE_ENV=development
```
Start backend:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

## Default Accounts (For Testing)
You can register new accounts as either 'User' or 'Admin' using the registration form.

## Project Structure
- `backend/`: Express server, MongoDB models, controllers, and routes.
- `frontend/`: React application with Vite, organized into components, pages, and context.
