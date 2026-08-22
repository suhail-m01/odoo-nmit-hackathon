from datetime import date, datetime
from pydantic import BaseModel
from app.models.enums import LeaveStatus


class LeaveTypeOut(BaseModel):
    id: int
    name: str
    code: str
    is_paid: bool
    requires_attachment: bool

    class Config:
        from_attributes = True


class LeaveBalanceOut(BaseModel):
    id: int
    leave_type_id: int
    year: int
    balance_days: float
    used_days: float
    leave_type: LeaveTypeOut

    class Config:
        from_attributes = True


class LeaveRequestCreate(BaseModel):
    leave_type_id: int
    start_date: date
    end_date: date
    reason: str | None = None


class LeaveRequestOut(BaseModel):
    id: int
    employee_id: int
    leave_type_id: int
    start_date: date
    end_date: date
    duration_days: float
    reason: str | None
    status: LeaveStatus
    review_note: str | None
    attachment_name: str | None
    created_at: datetime
    employee_name: str | None = None
    employee_code: str | None = None
    leave_type: LeaveTypeOut | None = None

    class Config:
        from_attributes = True


class LeaveDecision(BaseModel):
    note: str | None = None


class LeaveDashboardStats(BaseModel):
    total: int
    pending: int
    approved: int
    rejected: int