from app.models.department import Department
from app.models.student import Student
from app.models.user import User
from app.models.email_otp import EmailOtp
from app.models.notification import Notification
from app.models.skill import Skill, StudentSkill
from app.models.company import Company, CompanyContact
from app.models.job import Job, JobSkill, JobDepartment
from app.models.application import Application
from app.models.interview import Interview
from app.models.history import ApplicationStatusHistory
from app.models.offer import Offer
from app.models.placement import Placement

__all__ = [
    "Department",
    "Student",
    "User",
    "EmailOtp",
    "Notification",
    "Skill",
    "StudentSkill",
    "Company",
    "CompanyContact",
    "Job",
    "JobSkill",
    "JobDepartment",
    "Application",
    "Interview",
    "ApplicationStatusHistory",
    "Offer",
    "Placement",
]
