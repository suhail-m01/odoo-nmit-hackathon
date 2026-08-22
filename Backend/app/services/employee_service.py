from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Department, Employee, User
from app.models.enums import Role
from app.schemas.employee import EmployeeCreate, EmployeeUpdate
from app.core.security import hash_password


def generate_employee_code(db: Session, first_name: str, last_name: str, joining_year: int) -> str:
    # Prefix + 2 chars first + 2 chars last + year + 4 digit serial
    initials = f"{first_name[:2]}{last_name[:2]}".upper()
    prefix = f"{settings.company_prefix}{initials}{joining_year}"
    count = db.scalar(select(Employee).where(Employee.employee_code.like(f"{prefix}%")))
    serial = db.query(Employee).filter(Employee.employee_code.like(f"{prefix}%")).count() + 1
    # If there's already one with first initials only (count=1), use 0001; otherwise increment
    return f"{prefix}{serial:04d}"


def create_employee(db: Session, data: EmployeeCreate) -> Employee:
    user = User(
        email=str(data.email).lower(),
        hashed_password=hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    db.flush()

    code = generate_employee_code(db, data.first_name, data.last_name, data.date_of_joining.year)
    employee = Employee(
        user_id=user.id,
        employee_code=code,
        first_name=data.first_name,
        last_name=data.last_name,
        personal_email=str(data.personal_email).lower() if data.personal_email else None,
        mobile=data.mobile,
        job_title=data.job_title,
        location=data.location,
        date_of_birth=data.date_of_birth,
        date_of_joining=data.date_of_joining,
        gender=data.gender,
        marital_status=data.marital_status,
        nationality=data.nationality,
        residential_address=data.residential_address,
        bank_account_number=data.bank_account_number,
        bank_name=data.bank_name,
        ifsc_code=data.ifsc_code,
        pan=data.pan,
        uan=data.uan,
        department_id=data.department_id,
        manager_id=data.manager_id,
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


def update_employee(db: Session, employee: Employee, data: EmployeeUpdate) -> Employee:
    for field, value in data.model_dump(exclude_unset=True).items():
        if field == "personal_email" and value is not None:
            value = str(value).lower()
        setattr(employee, field, value)
    db.commit()
    db.refresh(employee)
    return employee


SELF_EDITABLE_FIELDS = {
    "personal_email", "mobile", "date_of_birth", "gender", "marital_status",
    "nationality", "residential_address", "bank_account_number", "bank_name",
    "ifsc_code", "pan", "uan",
}
