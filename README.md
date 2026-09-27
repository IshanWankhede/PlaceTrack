# PlaceTrack

**PlaceTrack** is a full-stack placement management and analytics platform for college placement cells. It centralizes student profiles, company drives, and job postings, automatically matches students to eligible jobs, tracks applications through multi-round interviews, and auto-generates placement records — with a live analytics dashboard for placement rate, package trends, and department performance.

Built with **React**, **FastAPI**, and **PostgreSQL**.

---

## 📌 Overview

This system digitizes the end-to-end campus placement workflow for a college/university placement cell:

- Maintain student profiles, CGPA, department, and skill sets
- Onboard companies and publish job openings with eligibility criteria
- Let students apply to jobs they are eligible for
- Track multi-round interview pipelines
- Auto-generate placement records on selection
- Provide real-time analytics (placement rate, package distribution, department-wise performance, etc.)

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), REST/JSON |
| Backend | FastAPI (Python) |
| ORM | SQLAlchemy |
| Database | PostgreSQL |
| Migrations | Alembic |
| Auth | JWT-based (FastAPI security utils) |
| Containerization | Docker & docker-compose (optional, for later stages) |

---

## 📁 Project Structure

```
placetrack/
│
├── README.md
├── ARCHITECTURE.md
├── DB_SCHEMA.md
├── PRD.md
├── REQUIREMENTS.md
├── ER_DIAGRAM.md
├── docker-compose.yml
├── .env.example
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── assets/
│       ├── components/       # Navbar, Sidebar, StatCard, DataTable, Modal, etc.
│       ├── layouts/          # DashboardLayout, AuthLayout
│       ├── pages/            # Dashboard, Students, Companies, Jobs, Applications...
│       ├── services/         # api.js + per-resource service files
│       ├── hooks/
│       ├── context/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
│
└── backend/
    ├── requirements.txt
    ├── .env.example
    ├── app/
    │   ├── main.py
    │   ├── core/              # config.py, security.py
    │   ├── database/          # database.py, base.py
    │   ├── models/            # SQLAlchemy ORM models
    │   ├── schemas/           # Pydantic schemas
    │   ├── crud/              # DB access layer
    │   ├── routers/           # API route handlers
    │   ├── services/          # eligibility.py, placement.py, analytics.py
    │   └── utils/
    ├── alembic/versions/
    └── tests/
```

---

## 🚀 Getting Started

```bash
git clone https://github.com/<your-username>/placetrack.git
cd placetrack
```

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+
- (Optional) Docker & Docker Compose

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # update DB credentials
alembic upgrade head          # run migrations
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Docker (optional, later stage)
```bash
docker-compose up --build
```

> Recommendation: get the app running locally first; introduce Docker once core features are stable.

---

## 🔑 Core Modules

1. **Student Management** — profiles, department mapping, CGPA, skills
2. **Company & Job Management** — company profiles, job postings, eligibility criteria
3. **Eligibility Engine** — auto-checks CGPA, department, and required skills per job
4. **Application Tracking** — students apply, status moves through a defined lifecycle
5. **Interview Pipeline** — multi-round interview tracking per application
6. **Placement Records** — auto-generated on selection via a DB trigger
7. **Analytics Dashboard** — placement rate, package stats, department/company breakdowns

---

## 📚 Related Documents

| Document | Purpose |
|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture & phased build plan |
| [DB_SCHEMA.md](./DB_SCHEMA.md) | Full database schema with constraints |
| [ER_DIAGRAM.md](./ER_DIAGRAM.md) | Entity-relationship diagram (Mermaid) |
| [PRD.md](./PRD.md) | Product requirements document |
| [REQUIREMENTS.md](./REQUIREMENTS.md) | Functional & non-functional requirements |

---

## 🗺️ API Base

All endpoints are versioned under:
```
/api/v1/
```
See `PRD.md` and `REQUIREMENTS.md` for the full endpoint list and eligibility logic.

---

## 🧪 Testing

```bash
cd backend
pytest tests/
```

---

## 📄 License

Internal academic/demo project — add a license here if this will be distributed publicly.
