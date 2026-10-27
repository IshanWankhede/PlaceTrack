from typing import Optional
from decimal import Decimal
from sqlalchemy import select, delete
from sqlalchemy.orm import Session

from app.models.job import Job, JobSkill, JobDepartment
from app.schemas.job import JobCreate, JobUpdate, JobSkillOut, JobDepartmentOut, JobOut


def _build_job_out(job: Job) -> JobOut:
    """Converts a Job ORM object (with loaded relationships) into a JobOut schema."""
    return JobOut(
        id=job.id,
        company_id=job.company_id,
        company_name=job.company.name,
        title=job.title,
        description=job.description,
        minimum_cgpa=job.minimum_cgpa,
        package=job.package,
        package_max=job.package_max,
        max_backlogs=job.max_backlogs,
        job_type=job.job_type,
        location=job.location,
        drive_date=job.drive_date,
        application_deadline=job.application_deadline,
        status=job.status,
        created_at=job.created_at,
        skills=[
            JobSkillOut(
                skill_id=js.skill_id,
                skill_name=js.skill.name,
                required_level=js.required_level,
            )
            for js in job.job_skills
        ],
        departments=[
            JobDepartmentOut(
                department_id=jd.department_id,
                department_name=jd.department.name,
            )
            for jd in job.job_departments
        ],
    )


def _load_job(db: Session, job_id: int) -> Optional[Job]:
    """Load a job with all relationships eagerly."""
    from sqlalchemy.orm import joinedload
    stmt = (
        select(Job)
        .where(Job.id == job_id)
        .options(
            joinedload(Job.company),
            joinedload(Job.job_skills).joinedload(JobSkill.skill),
            joinedload(Job.job_departments).joinedload(JobDepartment.department),
        )
    )
    return db.execute(stmt).unique().scalar_one_or_none()


def get_job(db: Session, job_id: int) -> Optional[JobOut]:
    job = _load_job(db, job_id)
    return _build_job_out(job) if job else None


def list_jobs(
    db: Session,
    company_id: Optional[int] = None,
    status: Optional[str] = None,
    job_type: Optional[str] = None,
    tier: Optional[str] = None,
    min_cgpa: Optional[Decimal] = None,
    skip: int = 0,
    limit: int = 50,
) -> tuple[list[JobOut], int]:
    from sqlalchemy.orm import joinedload
    from app.models.company import Company

    stmt = (
        select(Job)
        .join(Job.company)
        .options(
            joinedload(Job.company),
            joinedload(Job.job_skills).joinedload(JobSkill.skill),
            joinedload(Job.job_departments).joinedload(JobDepartment.department),
        )
    )
    if company_id is not None:
        stmt = stmt.where(Job.company_id == company_id)
    if status:
        stmt = stmt.where(Job.status == status.upper())
    if job_type:
        stmt = stmt.where(Job.job_type == job_type.upper())
    if tier:
        stmt = stmt.where(Company.tier == tier.upper())
    if min_cgpa is not None:
        stmt = stmt.where(Job.minimum_cgpa <= min_cgpa)

    # Count before pagination
    count_stmt = select(Job.id).join(Job.company)
    if company_id is not None:
        count_stmt = count_stmt.where(Job.company_id == company_id)
    if status:
        count_stmt = count_stmt.where(Job.status == status.upper())
    if job_type:
        count_stmt = count_stmt.where(Job.job_type == job_type.upper())
    if tier:
        count_stmt = count_stmt.where(Company.tier == tier.upper())
    if min_cgpa is not None:
        count_stmt = count_stmt.where(Job.minimum_cgpa <= min_cgpa)
    total = len(db.execute(count_stmt).scalars().all())

    stmt = stmt.order_by(Job.id).offset(skip).limit(limit)
    jobs = db.execute(stmt).unique().scalars().all()
    return [_build_job_out(j) for j in jobs], total


def create_job(db: Session, obj_in: JobCreate) -> JobOut:
    """Creates a job with its skills and departments in ONE transaction."""
    job = Job(
        company_id=obj_in.company_id,
        title=obj_in.title.strip(),
        description=obj_in.description,
        minimum_cgpa=obj_in.minimum_cgpa,
        package=obj_in.package,
        package_max=obj_in.package_max,
        max_backlogs=obj_in.max_backlogs,
        job_type=obj_in.job_type,
        location=obj_in.location,
        drive_date=obj_in.drive_date,
        application_deadline=obj_in.application_deadline,
        status=obj_in.status,
    )
    db.add(job)
    db.flush()  # get job.id without committing

    # Skills
    for s in obj_in.skills:
        db.add(JobSkill(job_id=job.id, skill_id=s.skill_id, required_level=s.required_level))

    # Departments
    for dept_id in obj_in.department_ids:
        db.add(JobDepartment(job_id=job.id, department_id=dept_id))

    db.commit()
    return _load_and_build(db, job.id)


def update_job(db: Session, job_id: int, obj_in: JobUpdate) -> Optional[JobOut]:
    """Updates a job; replaces skills and departments atomically if provided."""
    job = db.get(Job, job_id)
    if not job:
        return None

    if obj_in.title is not None:
        job.title = obj_in.title.strip()
    if obj_in.description is not None:
        job.description = obj_in.description
    if obj_in.minimum_cgpa is not None:
        job.minimum_cgpa = obj_in.minimum_cgpa
    if obj_in.package is not None:
        job.package = obj_in.package
    if obj_in.package_max is not None:
        job.package_max = obj_in.package_max
    if obj_in.max_backlogs is not None:
        job.max_backlogs = obj_in.max_backlogs
    if obj_in.job_type is not None:
        job.job_type = obj_in.job_type
    if obj_in.location is not None:
        job.location = obj_in.location
    if obj_in.drive_date is not None:
        job.drive_date = obj_in.drive_date
    if obj_in.application_deadline is not None:
        job.application_deadline = obj_in.application_deadline
    if obj_in.status is not None:
        job.status = obj_in.status

    # Replace skills if provided (including empty list = clear)
    if obj_in.skills is not None:
        db.execute(delete(JobSkill).where(JobSkill.job_id == job_id))
        for s in obj_in.skills:
            db.add(JobSkill(job_id=job_id, skill_id=s.skill_id, required_level=s.required_level))

    # Replace departments if provided (including empty list = open to all)
    if obj_in.department_ids is not None:
        db.execute(delete(JobDepartment).where(JobDepartment.job_id == job_id))
        for dept_id in obj_in.department_ids:
            db.add(JobDepartment(job_id=job_id, department_id=dept_id))

    db.commit()
    return _load_and_build(db, job_id)


def delete_job(db: Session, job_id: int) -> bool:
    job = db.get(Job, job_id)
    if not job:
        return False
    db.delete(job)
    db.commit()
    return True


def _load_and_build(db: Session, job_id: int) -> JobOut:
    job = _load_job(db, job_id)
    return _build_job_out(job)
