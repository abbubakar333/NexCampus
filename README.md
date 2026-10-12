# NexCampus

NexCampus is a Smart Campus Platform designed for modern education. It centralizes attendance, leaves, gate passes, complaints, and notices in one unified platform.

## Features
- **Role-based Access**: Separate dashboards for Admins, Faculty, and Students.
- **Attendance Management**: Track and view attendance.
- **Leave & Gate Pass Requests**: Streamlined approval workflows.
- **Complaint System**: Manage hostel and mess complaints effectively.
- **Notices**: Centralized announcements for the campus.

## Technology Stack
- **Frontend**: React, Vite, Tailwind CSS, React Router DOM, Axios, Lucide React
- **Backend**: Node.js, Express.js, PostgreSQL (Supabase)

## Installation & Setup

1. **Install Node.js** (v18+ recommended).
2. **Clone/Open project** in your editor.

### 3. Setup Database (Supabase PostgreSQL)
1. Create a Supabase project.
2. Get your Postgres connection string (DATABASE_URL).
3. Create a `.env` file in the `backend` folder based on `.env.example`:
   \`\`\`env
   DATABASE_URL=your_supabase_postgres_url
   JWT_SECRET=your_super_secret_jwt_key
   PORT=5000
   CLIENT_URL=http://localhost:5173
   \`\`\`

### 4. Install Dependencies
Run these commands:

\`\`\`bash
# Install backend dependencies
cd backend
npm install

# Run database migrations
npm run db:migrate

# Seed the database
npm run db:seed

# Install frontend dependencies
cd ../frontend
npm install
\`\`\`

### 5. Start the Application
You need two terminal windows:

Terminal 1 (Backend):
\`\`\`bash
cd backend
npm run dev
\`\`\`

Terminal 2 (Frontend):
\`\`\`bash
cd frontend
npm run dev
\`\`\`

The frontend will be available at \`http://localhost:5173\` and backend at \`http://localhost:5000\`.

## Demo Accounts

After running the seed script, you can log in with:

**Primary Admin:**
- Email: admin@nexcampus.demo
- Password: Demo@12345

**Department HO hodDs:**
- Email:hod_cse@nexcampus.demo (also ece, ee, me, ce)
- Password: Demo@12345

**Specialized Incharges:**
- Hostel Incharge: hostel_incharge@nexcampus.demo
- Gate Incharge: gate_incharge@nexcampus.demo
- Mess Incharge: mess_incharge@nexcampus.demo
- Account Section: account_incharge@nexcampus.demo
- Examination Section: exam_incharge@nexcampus.demo
- Password: Demo@12345

**Faculty:**
- Email: faculty1@nexcampus.demo
- Password: Demo@12345
*(Available up to faculty5@nexcampus.demo)*

**Student:**
- Email: student1@nexcampus.demo
- Password: Demo@12345
*(Available up to student30@nexcampus.demo)*
