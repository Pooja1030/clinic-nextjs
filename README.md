# 🏥 Clinic Management System (MERN + Docker + CI/CD)

A full-stack clinic management application built using the MERN stack, containerized with Docker, and integrated with CI/CD using GitHub Actions.

---

## 🚀 Tech Stack

* **Frontend:** Next.js (React)
* **Backend:** Node.js, Express
* **Database:** MongoDB
* **Containerization:** Docker, Docker Compose
* **CI/CD:** GitHub Actions
* **Cloud Storage:** Cloudinary

---

## 📦 Features

* User authentication (JWT-based)
* Patient & appointment management
* Prescription handling
* Image uploads via Cloudinary
* RESTful APIs
* Fully containerized architecture

---

## 🐳 Docker Setup

### Run locally using Docker

```bash
docker compose up --build
```

### Services

* Frontend → http://localhost:3000
* Backend → http://localhost:5000
* MongoDB → port 27017

---

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

---

## ⚙️ CI/CD Pipeline

Implemented using GitHub Actions:

* Builds Docker images for frontend & backend
* Injects environment variables securely
* Runs containers
* Tests backend API using curl

---

## 🧠 Architecture

Client (Next.js) → Backend (Node.js/Express) → MongoDB
↓
Cloudinary (Image Storage)

---

## 📌 Future Improvements

* Add role-based access control
* Add unit & integration tests
* Deploy on AWS (EC2 / ECS)
* Add monitoring (Prometheus + Grafana)

---

## 👩‍💻 Author

Pooja Sawant
