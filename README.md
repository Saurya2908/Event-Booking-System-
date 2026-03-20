# 🎟️ Event Booking System (Node.js + MySQL)

A mini backend system to manage events and ticket bookings.  
Built using Node.js (Express) and MySQL with transaction handling to prevent race conditions.

---

## 🚀 Features

- Create and view events
- Create and manage users
- Book tickets with concurrency-safe transactions
- Track user bookings
- Attendance validation via booking code
- Swagger API documentation

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- MySQL
- Swagger (OpenAPI)
- UUID (for booking codes)

---

## 📁 Project Structure

event-booking-system/
│
├── config/
├── controllers/
├── routes/
├── sql/
├── swagger/
├── app.js
├── package.json
└── README.md

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

git clone <your-repo-link>
cd event-booking-system

---

### 2️⃣ Install Dependencies

npm install

---

### 3️⃣ Setup MySQL

Make sure MySQL server is running.

Login:

mysql -u root -p

---

### 4️⃣ Create Database

CREATE DATABASE event_booking;
USE event_booking;

---

### 5️⃣ Import Schema

mysql -u root -p event_booking < sql/schema.sql

---

### 6️⃣ Configure Database Connection

Update file:

config/db.js

host: "localhost"  
user: "root"  
password: "your_password"  
database: "event_booking"

---

### 7️⃣ Run Server

node app.js

Server will start at:

http://localhost:3000

---

## 📘 API Documentation

Swagger UI:

http://localhost:3000/api-docs

---

## 🔗 API Endpoints

### 👤 Users
- POST /users → Create user
- GET /users → Get all users
- GET /users/:id/bookings → Get user bookings

### 🎉 Events
- GET /events → Get all events
- POST /events → Create event

### 🎟️ Bookings
- POST /bookings → Book tickets (transaction safe)

### ✅ Attendance
- POST /users/events/:id/attendance → Validate booking code

---

## ⚠️ Key Implementation Detail

### 🔒 Transaction Handling

Booking API uses:

- SELECT ... FOR UPDATE
- Transactions (BEGIN, COMMIT, ROLLBACK)

This prevents race conditions when multiple users book tickets simultaneously.

---

## 🧪 Testing

Use:
- Swagger UI
- Postman Collection (included)

---

## 📦 Submission Includes

- Source code (GitHub)
- SQL schema file
- Swagger documentation
- Postman collection
- README

---

## 👨‍💻 Author

Shaurya

---

## ⭐ Notes

- Designed with clean architecture and separation of concerns
- Handles concurrency issues in booking system
- Easily extendable for real-world applications
