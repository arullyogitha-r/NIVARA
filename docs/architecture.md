# System Architecture — NIVARA

## Overview
NIVARA is designed with a decoupled client-server architecture:
- **Client (Frontend)**: React Single-Page Application (SPA) bundled with Vite. Communicates with the backend via RESTful APIs over HTTPS.
- **Server (Backend)**: Python Flask REST API structured using the Application Factory Pattern and Blueprints.
- **Database**: MongoDB Atlas cloud cluster storing documents for complaints, users, departments, and audit logs.
- **Infrastructure**: Containerized with Docker and automated with a Jenkins CI/CD pipeline.

## Architectural Layers
```
[ Citizen / Admin Browser ]
            |
            v
[ React (Vite) Frontend - client ]
            |  (JSON / REST API)
            v
[ Flask Application - server ]
    ├── Routes (Blueprints)
    ├── Services (Business Logic)
    └── Models (Data Schemas)
            |
            v
[ MongoDB Atlas (Cloud Database) ]
```
