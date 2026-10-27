from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.errors import register_error_handlers
from app.routers import auth, companies, departments, health, jobs, skills, students

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Exception handlers
register_error_handlers(app)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health routers
app.include_router(health.router)                                  # /health
app.include_router(health.router, prefix=settings.api_v1_prefix)   # /api/v1/health

# Phase 2 Core API Routers under /api/v1
app.include_router(auth.router, prefix=settings.api_v1_prefix)
app.include_router(departments.router, prefix=settings.api_v1_prefix)
app.include_router(skills.router, prefix=settings.api_v1_prefix)
app.include_router(students.router, prefix=settings.api_v1_prefix)

# Phase 3: Companies, Jobs, Eligibility
app.include_router(companies.router, prefix=settings.api_v1_prefix)
app.include_router(jobs.router, prefix=settings.api_v1_prefix)
