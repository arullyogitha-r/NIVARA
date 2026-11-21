# NIVARA — Civic Complaint & Resolution Platform

NIVARA is a citizen-centric Civic Complaint & Resolution Platform engineered to bridge the gap between citizens and municipal authorities. The platform streamlines complaint registration, automated categorization, grievance redressal tracking, and administrative resolution workflows.

---

## 🛠 Technology Stack

- **Frontend**: React (Vite)
- **Backend**: Python Flask
- **Database**: MongoDB Atlas
- **Version Control**: Git & GitHub
- **Containerization**: Docker & Docker Compose
- **CI/CD Pipeline**: Jenkins

---

## 📂 Project Structure

```text
NIVARA/
├── .gitignore                      # Git ignore patterns for Node, Python, IDE, OS
├── README.md                       # Project overview, architecture, and setup
├── Jenkinsfile                     # Declarative Jenkins CI/CD pipeline definition
├── docker-compose.yml              # Local multi-container orchestration
│
├── client/                         # Frontend application (React + Vite)
│   ├── .env.example                # Frontend environment variable template
│   ├── Dockerfile                  # Multi-stage Docker build for React
│   ├── public/                     # Static assets (favicons, logos)
│   └── src/
│       ├── assets/                 # Images, SVGs, and styles
│       ├── components/             # Reusable React components
│       │   ├── common/             # Buttons, inputs, modals, cards
│       │   └── layout/             # Header, navbar, footer, sidebar
│       ├── pages/                  # Page-level components / views
│       ├── routes/                 # Client routing logic (React Router)
│       ├── services/               # API clients and HTTP services
│       ├── config/                 # Frontend configuration & constants
│       ├── hooks/                  # Custom React hooks
│       └── utils/                  # Formatting and helper functions
│
├── server/                         # Backend application (Python Flask)
│   ├── .env.example                # Backend environment variable template
│   ├── Dockerfile                  # Backend container configuration
│   ├── requirements.txt            # Python dependencies
│   ├── run.py                      # Application entry point
│   ├── app/
│   │   ├── __init__.py             # Flask application factory
│   │   ├── routes/                 # API route blueprints (auth, complaints, users)
│   │   ├── models/                 # MongoDB schemas and data models
│   │   ├── services/               # Core business logic and database interactions
│   │   ├── config/                 # Environment configurations & MongoDB settings
│   │   └── utils/                  # Decorators, auth guards, response helpers
│   └── tests/                      # Unit and integration test suites
│
└── docs/                           # Documentation
    ├── architecture.md             # System architecture & data flow
    ├── api-spec.md                 # REST API endpoints specification
    └── setup-guide.md              # Local setup and contribution guide
```

---

## 🚀 Getting Started

> **Note**: This repository currently contains the initial architectural scaffolding. Application features and dependencies will be introduced in subsequent milestones.

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.11+)
- Docker & Docker Compose
- MongoDB Atlas cluster connection

### Initial Setup Guidelines

#### 1. Frontend Setup (`client`)
```bash
cd client
cp .env.example .env
# npm install
# npm run dev
```

#### 2. Backend Setup (`server`)
```bash
cd server
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate
cp .env.example .env
# pip install -r requirements.txt
# python run.py
```

---

## 🔒 Security & Best Practices
- Never commit actual `.env` files containing credentials to version control.
- All MongoDB connection strings should be stored as environment variables.
- Ensure CORS and JWT policies are properly configured before deploying to production.
