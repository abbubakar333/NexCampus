
# 🎓 NexCampus — Campus Management Platform

**NexCampus** is a full-stack campus management platform designed to digitize and simplify everyday academic and administrative activities. It brings students, faculty, and administrators together through a centralized platform, reducing dependence on paperwork, manual registers, and scattered communication.

The project aims to make campus operations more organized, accessible, and efficient through role-based dashboards and centralized information management.

---

## 🚀 Key Features

### 👨‍🎓 Student Dashboard

* View relevant academic and campus information.
* Access attendance information.
* Submit leave requests and gate-pass applications.
* Submit hostel complaints and access mess-related information.
* View campus notices and announcements.

### 👨‍🏫 Faculty Dashboard

* Access faculty-specific information and dashboard features.
* Manage attendance where authorized.
* Access relevant academic information.
* Handle assigned academic responsibilities according to permissions.

### 🛡️ Administrator Dashboard

* Manage student and faculty accounts according to assigned permissions.
* Oversee campus operations.
* Manage notices and announcements.
* Monitor administrative activities.

### 🏫 Campus Management

* Attendance management.
* Leave and gate-pass requests.
* Hostel complaint management.
* Mess menu information and management.
* Campus notices and announcements.
* Role-based access control.

*Feature availability depends on the functionality implemented in the current version of the application.*

---

## 🛠️ Technology Stack

| Component           | Technology                                 |
| ------------------- | ------------------------------------------ |
| Frontend            | React.js                                   |
| Frontend Build Tool | Vite                                       |
| Styling             | Tailwind CSS, if configured in the project |
| Backend             | Node.js                                    |
| Backend Framework   | Express.js                                 |
| Database            | PostgreSQL                                 |
| Database Platform   | Supabase                                   |
| Version Control     | Git and GitHub                             |
| Deployment          | Render                                     |

---

## 📁 Project Structure

```text
NexCampus/
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   ├── package.json
│   └── server.js
│
├── .gitignore
└── README.md
```

*The exact files and directories may vary depending on the current implementation.*

---

## ⚙️ Getting Started

Follow these instructions to run NexCampus locally.

### 1. Prerequisites

Install the following:

* [Node.js](https://nodejs.org/)
* npm, which is included with Node.js
* Git
* A Supabase project with PostgreSQL configured

### 2. Clone the Repository

```bash
git clone https://github.com/abbubakar333/NexCampus.git
```

Navigate into the project directory:

```bash
cd NexCampus
```

### 3. Configure the Backend

Open a terminal in the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory.

Add the environment variables required by your backend configuration.

Example:

```env
PORT=5000
DATABASE_URL=your_supabase_postgresql_connection_string
JWT_SECRET=your_secure_random_secret
FRONTEND_URL=http://localhost:5173
```

**Important:**

* Replace the example values with your actual configuration.
* Use the exact environment variable names expected by your code.
* Never commit `.env` files or expose database credentials.
* Configure your Supabase connection string using the connection method supported by your database driver.

### 4. Configure the Database

1. Create or select your Supabase project.
2. Configure the PostgreSQL connection string.
3. Ensure the required database tables and schema are available.
4. Apply the migrations required by your application.
5. Create the necessary user accounts using your application's intended account-management process.

If the project uses Prisma, follow its existing schema and migration configuration. Do not reset a database containing important data.

### 5. Start the Backend

From the backend directory, run the start command defined in your `package.json`.

For example, if your project defines an appropriate `start` script:

```bash
npm start
```

The backend should start on the configured port.

### 6. Configure and Start the Frontend

Open a separate terminal:

```bash
cd frontend
npm install
```

Create a frontend environment file if your application uses one.

For example, if your frontend reads `VITE_API_URL`:

```env
VITE_API_URL=http://localhost:5000
```

Ensure the URL matches your backend configuration and API routing.

Start the frontend:

```bash
npm run dev
```

Vite will display the local development URL in your terminal, commonly:

```text
http://localhost:5173
```

Open the displayed URL in your browser.

---

## 🌐 Deployment

NexCampus is designed to use the following deployment architecture:

* **Frontend:** Render Static Site
* **Backend:** Render Web Service
* **Database:** Supabase PostgreSQL
* **Source Code:** GitHub

### Deployment Overview

1. Push the project code to GitHub.
2. Create a Render Web Service for the backend using `backend` as its root directory.
3. Configure the backend's production environment variables.
4. Deploy the backend and obtain its public URL.
5. Create a Render Static Site using `frontend` as its root directory.
6. Configure the frontend to use the deployed backend URL.
7. Configure the backend's CORS settings to allow requests from the deployed frontend.
8. Verify authentication, database connectivity, and application functionality.

### Production Environment Variables

Configure the required environment variables through Render's dashboard.

Typical examples include:

| Variable       | Purpose                               |
| -------------- | ------------------------------------- |
| `DATABASE_URL` | PostgreSQL database connection        |
| `JWT_SECRET`   | JWT signing and verification, if used |
| `FRONTEND_URL` | Allowed frontend origin, if used      |
| `PORT`         | Port supplied by the hosting platform |

Your actual configuration may require additional variables.

Never include production passwords, private keys, or other secrets in the repository.

---

## 🔐 Security Considerations

NexCampus is designed around role-based access to campus information.

Important security practices include:

* Protecting authentication credentials.
* Hashing passwords securely.
* Enforcing role-based authorization on the backend.
* Validating incoming requests.
* Keeping secrets in environment variables.
* Restricting access to administrative operations.
* Avoiding the exposure of private student information.
* Using HTTPS for production communication.

Authentication and authorization should be verified against the actual application implementation before production use.

---

## 🎯 Project Objectives

NexCampus aims to:

* Reduce paperwork and repetitive administrative processes.
* Centralize campus information and communication.
* Simplify student requests and administrative workflows.
* Improve access to relevant academic information.
* Organize attendance, notices, and campus services.
* Provide role-appropriate dashboards for different campus users.

---

## 🔮 Future Enhancements

Potential improvements include:

* Push notifications for important campus updates.
* Improved mobile accessibility.
* Multilingual support.
* Low-bandwidth optimizations.
* Additional reporting and analytics.
* Enhanced administrative monitoring.
* Further improvements to security and accessibility.

These are potential enhancements and are not necessarily available in the current version.

---

## 👨‍💻 Project Information

**Project Name:** NexCampus
**Project Type:** Full-Stack Web Application
**Purpose:** Campus Management and Digital Administration
**Development Context:** Hackathon Project

### Links

* **GitHub Repository:** https://github.com/abbubakar333/NexCampus
* **Live Demo:** Add your deployed website URL here once deployment is complete.

---

## 🤝 Contributions

Suggestions, feedback, and contributions are welcome.

If you would like to contribute:

1. Fork the repository.
2. Create a new branch.
3. Implement your changes.
4. Test your changes.
5. Submit a pull request describing your improvements.

---

## 📄 License

A license has not yet been specified for this project.

If you intend to make the source code available for reuse, consider adding an appropriate open-source license and a corresponding `LICENSE` file.

---

## Demo Accounts

**Primary Admin:**
- Email: admin@nexcampus.demo
- Password: Demo@12345

**Department HODs:**
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


**NexCampus — Making Campus Management Simpler, Smarter, and More Connected.** 🎓

