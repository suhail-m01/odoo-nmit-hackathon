from datetime import date, datetime
from pydantic import BaseModel
from app.models.enums import AttendanceStatus


class AttendanceOut(BaseModel):
    id: int
    employee_id: int
    date: date
    check_in_at: datetime | None
    check_out_at: datetime | None
    worked_minutes: int | None
    extra_minutes: int | None
    status: AttendanceStatus
    note: str | None
    employee_name: str | None = None

    class Config:
        from_attributes = True


class AttendanceSummary(BaseModel):
    total_days: int
    present_days: int
    absent_days: int
    on_leave_days: int
    total_worked_minutes: int
    total_extra_minutes: int