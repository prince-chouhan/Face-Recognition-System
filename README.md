# Face Recognition System

A face recognition system built using Python, JavaScript, Docker, and MySQL.  
This project allows you to detect, recognize, and manage faces via a web interface and backend APIs.

---

## Table of Contents

- [Features](#features)  
- [Architecture & Components](#architecture--components)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Installation](#installation)  
  - [Running with Docker](#running-with-docker)  
  - [Running Locally without Docker](#running-locally-without-docker)  
- [Usage](#usage)  
- [API Endpoints](#api-endpoints)  
- [Folder Structure](#folder-structure)  
- [Dependencies](#dependencies)  
- [Contributing](#contributing)  
- [License](#license)  
- [Contact](#contact)

---

## Features

- Face detection and recognition  
- Enrollment / registration of new faces  
- Web UI to manage, view, and verify faces  
- REST API backend  
- Uses MySQL as the database  

---

## Architecture & Components

- **Backend (Python / Flask / FastAPI / your choice)** — handles face detection, recognition, API endpoints  
- **Frontend (JavaScript / HTML / CSS / your choice)** — UI for interacting with the system  
- **MySQL** — stores user / face metadata, embeddings, logs  
- **Docker & Docker Compose** — containerize app, database, and dependencies  

---

## Getting Started

### Prerequisites

Make sure you have installed:

- Docker  
- Docker Compose  
- (If not using Docker) Python 3.8+  
- Pip (for Python dependencies)  
- MySQL (if running database locally)  

### Installation (Docker)

1. Clone the repository:

   ```bash
   git clone https://github.com/prince-chouhan/Face-Recognition-System.git
   cd Face-Recognition-System
   ```

2. Build and start containers:

   ```bash
   docker-compose up --build
   ```

3. The system should now be running.  
   - Backend API: `http://localhost:<backend-port>`  
   - Frontend: `http://localhost:<frontend-port>`  

4. To stop:

   ```bash
   docker-compose down
   ```

### Installation (Without Docker)

1. Clone the repository:

   ```bash
   git clone https://github.com/prince-chouhan/Face-Recognition-System.git
   cd Face-Recognition-System
   ```

2. Create & activate a virtual environment (optional):

   ```bash
   python3 -m venv venv
   source venv/bin/activate   # on Windows use `venv\Scripts\activate`
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Set up MySQL and configure connection settings (host, port, user, password, database) in your configuration file / environment variables.

5. Run the backend server:

   ```bash
   python app/main.py   # or whatever your entry point is
   ```

6. Serve the frontend (if separated) or open the HTML / JS in browser.

---

## Usage

1. Register / enroll a new user / face  
2. Upload reference images  
3. The system will extract embeddings and store them  
4. Use “recognize” / “verify” endpoint or UI to match live image / captured frame  
5. Get results (matched identity, confidence, etc.)  

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/enroll` | Enroll/register a new face with metadata |
| `POST` | `/api/recognize` | Recognize or verify face from input image |
| `GET` | `/api/users` | List all enrolled users/faces |
| `GET` | `/api/user/{id}` | Get details for a specific user |
| `DELETE` | `/api/user/{id}` | Remove a user / face |

> *Adjust paths, parameters, request/response formats as per your implementation*

---

## Folder Structure

```
Face-Recognition-System/
├── app/                  # Backend application code
│   ├── models/           # Database models, embeddings, face models
│   ├── routes/           # API route handlers
│   ├── services/         # Face detection / recognition logic
│   ├── config/           # Configuration, settings, environment config
│   └── main.py           # Entry point for backend
├── mysql-init/            # Scripts for initial MySQL setup / schema
├── Dockerfile              # Dockerfile for backend service
├── docker-compose.yml      # Compose file defining app + database containers
├── requirements.txt        # Python dependencies
└── README.md                # (this file)
```

You may also have a `frontend/` folder or static assets depending on your implementation.

---

## Dependencies

Key dependencies (as in your `requirements.txt`):

- face recognition / face detection libraries (e.g. `face-recognition`, `opencv-python`)  
- Flask / FastAPI / Django REST framework (whichever you used)  
- MySQL connector (`mysql-connector-python`, `pymysql`, or `mysqlclient`)  
- Other utility packages (e.g. `numpy`, `scikit-learn`, `Pillow`)  

Docker dependencies via `docker-compose.yml`: `mysql` image, any extra services.

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository  
2. Create a new branch (`feature/xyz` or `fix/abc`)  
3. Make your changes & add tests / documentation  
4. Submit a Pull Request  

Please follow the existing code style and include descriptive commit messages.

---

## License

Specify your license (e.g., MIT, Apache 2.0).  
If none, you may add:

```
MIT License

Copyright (c) 2025 Prince

Permission is hereby granted, ...
...
```

(Ensure you add the full text of the license.)

---

## Contact

If you have any questions or want to reach out:

- **Author / Maintainer**: Prince Chouhan  
- GitHub: https://github.com/prince-chouhan  
