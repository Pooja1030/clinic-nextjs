# 🏥 Clinic Prescripto - Full Stack Dockerized Application

A production-ready full stack application built with Next.js, Node.js, MongoDB, and fully containerized using Docker with CI/CD pipeline.

## 🚀 Tech Stack

* **Frontend:** Next.js (React)
* **Backend:** Node.js, Express
* **Database:** MongoDB
* **Containerization:** Docker, Docker Compose
* **CI/CD:** GitHub Actions
* **Cloud Storage:** Cloudinary
* **Database UI:** Mongo Express

## 🧱 Architecture

Frontend (Next.js)
⬇
Backend (Node.js API)
⬇
MongoDB (Database)

All services are containerized and connected via Docker network.

## 🐳 Docker Setup

### Prerequisites

* Docker installed

### Run the project

```bash
docker compose up --build
```

## 📦 Services

| Service       | Port  |
| ------------- | ----- |
| Frontend      | 3000  |
| Backend       | 5000  |
| MongoDB       | 27017 |
| Mongo Express | 8081  |

## 🌐 Access URLs

* Frontend: http://localhost:3000
* Backend: http://localhost:5000
* Mongo UI: http://localhost:8081

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb://mongo:27017/clinic
JWT_SECRET=your_secret

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Frontend (`.env.production`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## ⚙️ CI/CD Pipeline

Implemented using GitHub Actions:

* Builds Docker images
* Injects environment variables securely using GitHub Secrets
* Runs containers using Docker Compose
* Tests backend API using curl

## 📦 Features

* User authentication (JWT)
* Patient management
* Appointment scheduling
* Prescription system
* Reminder system
* Image upload using Cloudinary
* MongoDB Admin UI

## 🧠 System Design (High-Level)

```text
User (Browser)
      ↓
Frontend (Next.js - Port 3000)
      ↓
Backend API (Node.js - Port 5000)
      ↓
MongoDB (Port 27017)
```

## 🐳 Docker Architecture

```text
Docker Host (Ubuntu VM)
│
├── clinic_frontend
├── clinic_backend
├── clinic_mongo
├── clinic_mongo_express
│
└── Docker Network (bridge)
```

## 🔗 Container Communication

Instead of using `localhost`, containers communicate using service names:

```text
frontend → backend
backend → mongo
```

## 🔮 Future Improvements

* Add role-based access control
* Secure MongoDB authentication
* Deploy on AWS EC2
* Add Nginx reverse proxy
* Enable HTTPS (SSL)
* Add monitoring (Prometheus, Grafana)

## 👩‍💻 Author

**Pooja Sawant**
