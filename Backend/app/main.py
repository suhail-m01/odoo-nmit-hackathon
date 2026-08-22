import os
from contextlib import asynccontextmanager
from datetime import date, datetime, timedelta

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import attendance, auth, dashboard, employees, leave, salary
from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models import (
    AttendanceRecord, Department, Employee, LeaveBalance, LeaveRequest, LeaveType,
    Salary, SalaryComponent, User,
)
from app.models.enums import AttendanceStatus, LeaveStatus, Role


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            return

        # Departments
        eng = Department(name="Engineering", code="ENG")
        hr_dept = Department(name="Human Resources", code="HR")
        ops = Department(name="Operations", code="OPS")
        db.add_all([eng, hr_dept, ops])
        db.flush()

        # Users
        admin = User(email="admin@hrms.io", hashed_password=hash_password("admin123"), role=Role.ADMIN)
        hr = User(email="hr@hrms.io", hashed_password=hash_password("hr12345"), role=Role.HR_OFFICER)
        emp_user = User(email="john@hrms.io", hashed_password=hash_password("emp12345"), role=Role.EMPLOYEE)
        emp2 = User(email="jane@hrms.io", hashed_password=hash_password("emp12345"), role=Role.EMPLOYEE)
        emp3 = User(email="rohan@hrms.io", hashed_password=hash_password("emp12345"), role=Role.EMPLOYEE)
        db.add_all([admin, hr, emp_user, emp2, emp3])
        db.flush()

        # Employees
        e1 = Employee(
            user_id=emp_user.id, employee_code="OIJO20220001",
            first_name="John", last_name="Doe", personal_email="john.doe@gmail.com",
            mobile="+91 98765 43210", job_title="Senior Software Engineer",
            location="Bengaluru", date_of_birth=date(1995, 4, 12),
            date_of_joining=date(2022, 6, 1), gender="Male", marital_status="Single",
            nationality="Indian", residential_address="MG Road, Bengaluru",
            department_id=eng.id,
        )
        e2 = Employee(
            user_id=emp2.id, employee_code="OIJA20230001",
            first_name="Jane", last_name="Smith", personal_email="jane.smith@gmail.com",
            mobile="+91 99887 76655", job_title="Product Designer",
            location="Bengaluru", date_of_birth=date(1996, 9, 20),
            date_of_joining=date(2023, 1, 15), gender="Female", marital_status="Married",
            nationality="Indian", department_id=eng.id,
        )
        e3 = Employee(
            user_id=emp3.id, employee_code="OIRO20240001",
            first_name="Rohan", last_name="Verma", personal_email="rohan.verma@gmail.com",
            mobile="+91 90909 80808", job_title="HR Executive",
            location="Mumbai", date_of_birth=date(1997, 1, 5),
            date_of_joining=date(2024, 3, 10), gender="Male", marital_status="Single",
            nationality="Indian", department_id=hr_dept.id,
        )
        hr_emp = Employee(
            user_id=hr.id, employee_code="OIHR20210001",
            first_name="Priya", last_name="Nair", personal_email="priya.nair@gmail.com",
            mobile="+91 91234 56780", job_title="HR Officer",
            location="Bengaluru", date_of_birth=date(1990, 11, 3),
            date_of_joining=date(2021, 5, 20), gender="Female", marital_status="Married",
            nationality="Indian", department_id=hr_dept.id,
        )
        db.add_all([e1, e2, e3, hr_emp])
        db.flush()

        # Attendance history for e1
        today = date.today()
        for i in range(1, 25):
            d = today - timedelta(days=i)
            if d.weekday() >= 5:
                continue
            check_in = datetime.combine(d, datetime.min.time()).replace(hour=10, minute=(i % 15))
            worked_h = 8 + (i % 3)
            check_out = check_in + timedelta(hours=worked_h)
            db.add(AttendanceRecord(
                employee_id=e1.id, date=d, check_in_at=check_in, check_out_at=check_out,
                worked_minutes=worked_h * 60, extra_minutes=max(0, worked_h - 8) * 60,
                status=AttendanceStatus.PRESENT,
            ))

        # Leave types
        pto = LeaveType(name="Paid Time Off", code="pto", is_paid=True, default_balance_days=24)
        sick = LeaveType(name="Sick Leave", code="sick", is_paid=True, requires_attachment=True, default_balance_days=12)
        unpaid = LeaveType(name="Unpaid Leave", code="unpaid", is_paid=False, default_balance_days=0)
        db.add_all([pto, sick, unpaid])
        db.flush()

        # Balances
        db.add_all([
            LeaveBalance(employee_id=e1.id, leave_type_id=pto.id, year=today.year, balance_days=24, used_days=2),
            LeaveBalance(employee_id=e1.id, leave_type_id=sick.id, year=today.year, balance_days=12, used_days=1),
            LeaveBalance(employee_id=e1.id, leave_type_id=unpaid.id, year=today.year, balance_days=0, used_days=0),
        ])

        # Sample pending leave
        db.add(LeaveRequest(
            employee_id=e2.id, leave_type_id=pto.id,
            start_date=today + timedelta(days=3), end_date=today + timedelta(days=5),
            duration_days=3, reason="Family vacation", status=LeaveStatus.PENDING,
        ))
        db.add(LeaveRequest(
            employee_id=e3.id, leave_type_id=sick.id,
            start_date=today - timedelta(days=2), end_date=today - timedelta(days=1),
            duration_days=2, reason="Flu", status=LeaveStatus.APPROVED,
        ))

        # Salary for e1
        sal = Salary(employee_id=e1.id, wage=750000, monthly_wage=62500, yearly_wage=750000,
                     working_days=22, working_hours=8, pf_percentage=12, professional_tax=200)
        db.add(sal)
        db.flush()
        db.add_all([
            SalaryComponent(salary_id=sal.id, name="Basic Salary", base="wage", percentage=50, amount=375000),
            SalaryComponent(salary_id=sal.id, name="House Rent Allowance", base="basic", percentage=50, amount=187500),
            SalaryComponent(salary_id=sal.id, name="Standard Allowance", base="wage", percentage=20, amount=150000),
            SalaryComponent(salary_id=sal.id, name="Performance Bonus", base="wage", percentage=5, amount=37500),
        ])

        db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(settings.upload_dir, exist_ok=True)
    seed()
    yield


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

prefix = settings.api_v1_prefix
app.include_router(auth.router, prefix=prefix)
app.include_router(employees.router, prefix=prefix)
app.include_router(attendance.router, prefix=prefix)
app.include_router(leave.router, prefix=prefix)
app.include_router(salary.router, prefix=prefix)
app.include_router(dashboard.router, prefix=prefix)


@app.get("/")
def root():
    return {"app": settings.app_name, "docs": "/docs"}
