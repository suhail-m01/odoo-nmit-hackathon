from datetime import date, datetime
from sqlalchemy import (
    Boolean, Date, DateTime, Enum, Float, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint, func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import AttendanceStatus, LeaveStatus, Role


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[Role] = mapped_column(Enum(Role), default=Role.EMPLOYEE)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    employee: Mapped["Employee | None"] = relationship(back_populates="user", uselist=False)

    @property
    def employee_id(self) -> int | None:
        return self.employee.id if self.employee else None


class Department(Base):
    __tablename__ = "departments"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True)
    code: Mapped[str] = mapped_column(String(20), unique=True)

    employees: Mapped[list["Employee"]] = relationship(back_populates="department")


class Employee(Base):
    __tablename__ = "employees"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    employee_code: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    first_name: Mapped[str] = mapped_column(String(80))
    last_name: Mapped[str] = mapped_column(String(80))
    personal_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    mobile: Mapped[str | None] = mapped_column(String(20), nullable=True)
    job_title: Mapped[str] = mapped_column(String(120), default="Employee")
    location: Mapped[str | None] = mapped_column(String(120), nullable=True)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    date_of_joining: Mapped[date] = mapped_column(Date)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    marital_status: Mapped[str | None] = mapped_column(String(20), nullable=True)
    nationality: Mapped[str | None] = mapped_column(String(60), nullable=True)
    residential_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    bank_account_number: Mapped[str | None] = mapped_column(String(60), nullable=True)
    bank_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    ifsc_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    pan: Mapped[str | None] = mapped_column(String(20), nullable=True)
    uan: Mapped[str | None] = mapped_column(String(30), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    department_id: Mapped[int | None] = mapped_column(ForeignKey("departments.id"), nullable=True)
    manager_id: Mapped[int | None] = mapped_column(ForeignKey("employees.id"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped[User] = relationship(back_populates="employee")
    department: Mapped[Department | None] = relationship(back_populates="employees")
    attendance: Mapped[list["AttendanceRecord"]] = relationship(back_populates="employee", cascade="all,delete-orphan")
    leave_requests: Mapped[list["LeaveRequest"]] = relationship(back_populates="employee", cascade="all,delete-orphan")
    balances: Mapped[list["LeaveBalance"]] = relationship(back_populates="employee", cascade="all,delete-orphan")
    salary: Mapped["Salary | None"] = relationship(back_populates="employee", uselist=False, cascade="all,delete-orphan")


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    __table_args__ = (UniqueConstraint("employee_id", "date", name="uq_emp_date"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"))
    date: Mapped[date] = mapped_column(Date, index=True)
    check_in_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    check_out_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    worked_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    extra_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[AttendanceStatus] = mapped_column(Enum(AttendanceStatus), default=AttendanceStatus.ABSENT)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)

    employee: Mapped[Employee] = relationship(back_populates="attendance")


class LeaveType(Base):
    __tablename__ = "leave_types"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True)
    code: Mapped[str] = mapped_column(String(20), unique=True)
    is_paid: Mapped[bool] = mapped_column(Boolean, default=True)
    requires_attachment: Mapped[bool] = mapped_column(Boolean, default=False)
    default_balance_days: Mapped[float] = mapped_column(Float, default=0.0)

    requests: Mapped[list["LeaveRequest"]] = relationship(back_populates="leave_type")


class LeaveBalance(Base):
    __tablename__ = "leave_balances"
    __table_args__ = (UniqueConstraint("employee_id", "leave_type_id", "year", name="uq_emp_lt_year"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"))
    leave_type_id: Mapped[int] = mapped_column(ForeignKey("leave_types.id"))
    year: Mapped[int] = mapped_column(Integer)
    balance_days: Mapped[float] = mapped_column(Float, default=0.0)
    used_days: Mapped[float] = mapped_column(Float, default=0.0)

    employee: Mapped[Employee] = relationship(back_populates="balances")
    leave_type: Mapped[LeaveType] = relationship()


class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"))
    leave_type_id: Mapped[int] = mapped_column(ForeignKey("leave_types.id"))
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date] = mapped_column(Date)
    duration_days: Mapped[float] = mapped_column(Float)
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[LeaveStatus] = mapped_column(Enum(LeaveStatus), default=LeaveStatus.PENDING)
    reviewed_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    review_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    attachment_path: Mapped[str | None] = mapped_column(String(255), nullable=True)
    attachment_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    employee: Mapped[Employee] = relationship(back_populates="leave_requests")
    leave_type: Mapped[LeaveType] = relationship(back_populates="requests")


class Salary(Base):
    __tablename__ = "salaries"
    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), unique=True)
    wage: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    monthly_wage: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    yearly_wage: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    working_days: Mapped[int] = mapped_column(Integer, default=22)
    working_hours: Mapped[float] = mapped_column(Float, default=8.0)
    pf_percentage: Mapped[float] = mapped_column(Float, default=12.0)
    professional_tax: Mapped[float] = mapped_column(Numeric(10, 2), default=200)
    effective_date: Mapped[date] = mapped_column(Date, default=date.today)

    employee: Mapped[Employee] = relationship(back_populates="salary")
    components: Mapped[list["SalaryComponent"]] = relationship(back_populates="salary", cascade="all,delete-orphan")


class SalaryComponent(Base):
    __tablename__ = "salary_components"
    id: Mapped[int] = mapped_column(primary_key=True)
    salary_id: Mapped[int] = mapped_column(ForeignKey("salaries.id"))
    name: Mapped[str] = mapped_column(String(80))
    base: Mapped[str] = mapped_column(String(20), default="wage")  # wage | basic | hra
    percentage: Mapped[float] = mapped_column(Float, default=0)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)

    salary: Mapped[Salary] = relationship(back_populates="components")