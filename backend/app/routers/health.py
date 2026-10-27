from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database.database import get_db

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    return {"status": "ok", "service": "placetrack-backend"}


@router.get("/health/db")
def health_db(db: Session = Depends(get_db)):
    """Proves backend -> PostgreSQL connectivity and that the SQL init scripts ran."""
    db.execute(text("SELECT 1"))
    tables = db.execute(
        text("SELECT count(*) FROM information_schema.tables "
             "WHERE table_schema = 'public' AND table_type = 'BASE TABLE'")
    ).scalar()
    return {"status": "ok", "database": "connected", "public_tables": tables}
