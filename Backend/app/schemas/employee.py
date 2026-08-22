from datetime import date
from pydantic import BaseModel, EmailStr, Field
from app.models.enums import Role


class DepartmentOut(BaseModel):
    id: int
    name: str
    code: str

    class Config:
        from_attributes = True


class EmployeeBase(BaseModel):
    first_name: str = Field(min_length=1, max_length=80)
    last_name: str = Field(min_length=1, max_length=80)
    personal_email: EmailStr | None = None
    mobile: str | None = None
    job_title: str = "Employee"
    location: str | None = None
    date_of_birth: date | None = None
    date_of_joining: date
    gender: str | None = None
    marital_status: str | None = None
    nationality: str | None = None
    residential_address: str | None = None
    bank_account_number: str | None = None
    bank_name: str | None = None
    ifsc_code: str | None = None
    pan: str | None = None
    uan: str | None = None
    department_id: int | None = None
    manager_id: int | None = None


class EmployeeCreate(EmployeeBase):
    email: EmailStr
    password: str = Field(min_length=6)
    role: Role = Role.EMPLOYEE


class EmployeeUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    personal_email: EmailStr | None = None
    mobile: str | None = None
    job_title: str | None = None
    location: str | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    marital_status: str | None = None
    nationality: str | None = None
    residential_address: str | None = None
    bank_account_number: str | None = None
    bank_name: str | None = None
    ifsc_code: str | None = None
    pan: str | None = None
    uan: str | None = None
    department_id: int | None = None
    manager_id: int | None = None


class EmployeeOut(EmployeeBase):
    id: int
    employee_code: str
    is_active: bool
    department: DepartmentOut | None = None

    class Config:
        from_attributes = True


class EmployeeListItem(BaseModel):
    id: int
    employee_code: str
    first_name: str
    last_name: str
    job_title: str
    location: str | None
    personal_email: EmailStr | None
    is_active: bool
    department: DepartmentOut | None = None
    today_status: str | None = None

    class Config:
        from_attributes = True


class PagedResponse(BaseModel):
    items: list
    total: int
    page: int
    page_size: int
