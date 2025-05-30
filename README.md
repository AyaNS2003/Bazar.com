# Bazar.com
![Image](https://github.com/user-attachments/assets/67f0ba42-7a3b-4430-9bab-9f8a88b01728)
## System Components
Bazar.com is made up of the following services:

### 1. Catalog Service
- Manages the book inventory.
- Supports searching for books by topic.
- Fetches book details by ID.

### 2. Order Service
- Handles placing book orders.
- Updates the book stock after a successful purchase.

### 3. Frontend Service
- Acts as the **API gateway**.
- Receives client requests and routes them to the appropriate backend service (Catalog or Order).

---

## Features

- Built with **Node.js** and **Express**.
- Containerized using **Docker**.
- Services communicate via **HTTP REST** calls.
- Designed to run in a **distributed environment** using `docker-compose`.

