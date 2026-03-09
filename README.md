# Restaurant App

Restaurant ordering system — Next.js + Express (Serverless) + MongoDB.

---

## Requirements

- Node.js >= 22.x
- npm >= 10.x
- Docker >= 20.x (for local MongoDB)

---

## Structure

- backend/: Express API + Serverless
- frontend/: Next.js (App Router)

---

## Environment setup

1. Clone the repo and enter the directory:

   ```bash
   git clone <repo-url>
   cd Restaurant
   ```

2. Create environment files:
   - backend/.env (copy backend/.env.example)
   - frontend/.env.local (copy frontend/.env.example)
     > Default values work for local development.

---

## How to run the project

1. Start MongoDB:

   ```bash
   cd backend
   docker compose up -d
   ```

2. Install dependencies:

   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. Seed sample data:

   ```bash
   cd backend
   npm run seed
   ```

4. Start the backend:

   ```bash
   cd backend
   npm run dev
   ```

5. In another terminal, start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

Open http://localhost:3000

---

## Testing

Space to explain how to run tests, lint, and build. (Complete here)

---

## Stack

- Frontend: Next.js 16, React 19, Tailwind CSS 4, Zustand, shadcn/ui
- Backend: Serverless Framework, Express 5, Mongoose 9
- Database: MongoDB (Docker)
- Language: TypeScript
