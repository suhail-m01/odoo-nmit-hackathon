from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_hr
from app.core.database import get_db
from app.models import AttendanceRecord, Employee, User
from app.models.enums import Role
from app.schemas.attendance import AttendanceOut, AttendanceSummary
from app.services import attendance_service

router = APIRouter(prefix="/attendance", tags=["attendance"])


def _to_out(r: AttendanceRecord, emp_name: str | None = None) -> AttendanceOut:
    return AttendanceOut(
        id=r.id, employee_id=r.employee_id, date=r.date,
        check_in_at=r.check_in_at, check_out_at=r.check_out_at,
        worked_minutes=r.worked_minutes, extra_minutes=r.extra_minutes,
        status=r.status, note=r.note, employee_name=emp_name,
    )


@router.post("/check-in", response_model=AttendanceOut)
def check_in(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user.employee_id:
        raise Exception("No employee profile")
    r = attendance_service.check_in(db, user.employee_id)
    return _to_out(r)


@router.post("/check-out", response_model=AttendanceOut)
def check_out(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user.employee_id:
        raise Exception("No employee profile")
    r = attendance_service.check_out(db, user.employee_id)
    return _to_out(r)


@router.get("/today", response_model=AttendanceOut | None)
def today(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user.employee_id:
        return None
    r = attendance_service.get_today_status(db, user.employee_id)
    return _to_out(r) if r else None


@router.get("/me", response_model=dict)
def my_attendance(
    year: int = Query(default_factory=lambda: date.today().year),
    month: int = Query(default_factory=lambda: date.today().month, ge=1, le=12),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    records = attendance_service.get_month_records(db, user.employee_id, year, month)
    summary = attendance_service.monthly_summary(db, user.employee_id, year, month)
    return {
        "records": [_to_out(r).model_dump(mode="json") for r in records],
        "summary": summary,
    }


@router.get("/all", response_model=dict)
def all_attendance(
    year: int | None = None,
    month: int | None = None,
    employee_id: int | None = None,
    department_id: int | None = None,
    _: User = Depends(require_hr),
    db: Session = Depends(get_db),
):
    q = select(AttendanceRecord, Employee).join(Employee, Employee.id == AttendanceRecord.employee_id)
    if employee_id:
        q = q.where(AttendanceRecord.employee_id == employee_id)
    if department_id:
        q = q.where(Employee.department_id == department_id)
    if year and month:
        start = date(year, month, 1)
        end = date(year + (month // 12), (month % 12) + 1, 1)
        q = q.where(AttendanceRecord.date >= start, AttendanceRecord.date < end)
    rows = db.execute(q.order_by(AttendanceRecord.date.desc()).limit(500)).all()
    return {
        "items": [
            _to_out(r, f"{e.first_name} {e.last_name}").model_dump(mode="json")
            for r, e in rows
        ]
    }


@router.get("/summary", response_model=AttendanceSummary)
def attendance_summary(
    year: int = Query(default_factory=lambda: date.today().year),
    month: int = Query(default_factory=lambda: date.today().month),
    employee_id: int | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    emp_id = employee_id if user.role in (Role.HR_OFFICER, Role.ADMIN) and employee_id else user.employee_id
    s = attendance_service.monthly_summary(db, emp_id, year, month)
    return AttendanceSummary(**s)