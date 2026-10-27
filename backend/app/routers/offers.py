from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_roles
from app.core.errors import AppException, NotFoundError
from app.crud import crud_offer
from app.database.database import get_db
from app.models.user import User
from app.schemas.offer import OfferBreakdownUpdate, OfferOut

router = APIRouter(prefix="/offers", tags=["offers"])


@router.get("/mine", response_model=list[OfferOut])
def get_my_offers(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("STUDENT")),
):
    """Retrieve all offers received by the authenticated student."""
    if not current_user.student_id:
        raise AppException(status_code=400, detail="Student profile not linked to user account")

    return crud_offer.list_offers_overview(db, student_id=current_user.student_id)


@router.get("", response_model=list[OfferOut])
def list_offers(
    status: Optional[str] = Query(None, description="Filter by offer status (PENDING, ACCEPTED, DECLINED, SUPERSEDED, LOCKED)"),
    student_id: Optional[int] = Query(None, description="Filter by student ID"),
    company_id: Optional[int] = Query(None, description="Filter by company ID"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("ADMIN", "STAFF")),
):
    """List all offers with company tier and CTC breakdown."""
    return crud_offer.list_offers_overview(
        db,
        status=status,
        student_id=student_id,
        company_id=company_id,
        limit=limit,
        offset=offset,
    )


@router.patch("/{offer_id}/breakdown", response_model=OfferOut)
def update_offer_breakdown(
    offer_id: int,
    body: OfferBreakdownUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("ADMIN", "STAFF")),
):
    """Staff sets the CTC breakdown (base, bonus, ESOP) of a PENDING offer."""
    offer = crud_offer.get_offer(db, offer_id)
    if not offer:
        raise NotFoundError(f"Offer {offer_id} not found")

    return crud_offer.set_offer_breakdown(
        db,
        offer_id=offer_id,
        base_lpa=body.base_lpa,
        bonus_lpa=body.bonus_lpa,
        esop_lpa=body.esop_lpa,
    )


@router.post("/{offer_id}/accept", response_model=OfferOut)
def accept_offer(
    offer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("STUDENT")),
):
    """
    Student accepts an offer.
    Enforces the single-offer / dream-offer policy. Creates or upgrades placement row.
    Supersedes lower tier accepted offers and locks same/lower tier pending offers.
    """
    offer = crud_offer.get_offer(db, offer_id)
    if not offer or offer.student_id != current_user.student_id:
        raise NotFoundError("Offer not found")

    return crud_offer.respond_to_offer(db, offer_id=offer_id, accept=True)


@router.post("/{offer_id}/decline", response_model=OfferOut)
def decline_offer(
    offer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("STUDENT")),
):
    """Student declines an offer."""
    offer = crud_offer.get_offer(db, offer_id)
    if not offer or offer.student_id != current_user.student_id:
        raise NotFoundError("Offer not found")

    return crud_offer.respond_to_offer(db, offer_id=offer_id, accept=False)
