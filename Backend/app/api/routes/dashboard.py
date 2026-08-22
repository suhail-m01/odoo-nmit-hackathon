from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models import AttendanceRecord, Department, LeaveBalance, LeaveRequest, LeaveType, User
from app.models.enums import LeaveStatus, Role
from app.services import attendance_service, leave_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("")
def dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = attendance_service.get_today_status(db, user.employee_id)
    year = date.today().year
    month = date.today().month
    summary = attendance_service.monthly_summary(db, user.employee_id, year, month)

    for lt in db.scalars(select(LeaveType)).all():
        leave_service.get_or_create_balance(db, user.employee_id, lt.id, year)
    db.commit()

    balances = db.scalars(
        select(LeaveBalance).options(selectinload(LeaveBalance.leave_type))
        .where(LeaveBalance.employee_id == user.employee_id, LeaveBalance.year == year)
    ).all()

    recent_attendance = db.scalars(
        select(AttendanceRecord)
        .where(AttendanceRecord.employee_id == user.employee_id)
        .order_by(AttendanceRecord.date.desc()).limit(5)
    ).all()

    pending = db.scalars(
        select(LeaveRequest)
        .where(LeaveRequest.employee_id == user.employee_id, LeaveRequest.status == LeaveStatus.PENDING)
        .order_by(LeaveRequest.created_at.desc())
    ).all()

    return {
        "today": {
            "status": today.status.value if today else "absent",
            "check_in_at": today.check_in_at if today else None,
            "check_out_at": today.check_out_at if today else None,
            "worked_minutes": today.worked_minutes if today else None,
        },
        "summary": summary,
        "balances": [
            {
                "name": b.leave_type.name,
                "code": b.leave_type.code,
                "balance": b.balance_days - b.used_days,
                "used": b.used_days,
                "total": b.balance_days,
            } for b in balances
        ],
        "recent_attendance": [
            {
                "date": r.date.isoformat(),
                "check_in": r.check_in_at.isoformat() if r.check_in_at else None,
                "check_out": r.check_out_at.isoformat() if r.check_out_at else None,
                "worked_minutes": r.worked_minutes,
                "extra_minutes": r.extra_minutes,
                "status": r.status.value,
            } for r in recent_attendance
        ],
        "pending_count": len(pending),
    }
