from datetime import date, datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AttendanceRecord, Employee, LeaveBalance, LeaveRequest, LeaveType
from app.models.enums import AttendanceStatus, LeaveStatus
from app.schemas.leave import LeaveRequestCreate


def _business_days(start: date, end: date) -> float:
    if end < start:
        raise HTTPException(status_code=400, detail="End date cannot be before start date")
    days = 0
    cur = start
    while cur <= end:
        if cur.weekday() < 5:  # Mon-Fri
            days += 1
        cur += timedelta(days=1)
    return float(days)


def get_or_create_balance(db: Session, employee_id: int, leave_type_id: int, year: int) -> LeaveBalance:
    bal = db.scalar(
        select(LeaveBalance).where(
            LeaveBalance.employee_id == employee_id,
            LeaveBalance.leave_type_id == leave_type_id,
            LeaveBalance.year == year,
        )
    )
    if not bal:
        lt = db.get(LeaveType, leave_type_id)
        bal = LeaveBalance(
            employee_id=employee_id,
            leave_type_id=leave_type_id,
            year=year,
            balance_days=lt.default_balance_days if lt else 0,
            used_days=0,
        )
        db.add(bal)
        db.flush()
    return bal


def create_request(
    db: Session, employee_id: int, data: LeaveRequestCreate, attachment_path: str | None, attachment_name: str | None,
) -> LeaveRequest:
    duration = _business_days(data.start_date, data.end_date)
    lt = db.get(LeaveType, data.leave_type_id)
    if not lt:
        raise HTTPException(status_code=404, detail="Leave type not found")

    if lt.requires_attachment and not attachment_path:
        raise HTTPException(status_code=400, detail="Medical certificate is required for sick leave")

    year = data.start_date.year
    bal = get_or_create_balance(db, employee_id, data.leave_type_id, year)
    if lt.is_paid and (bal.balance_days - bal.used_days) < duration:
        raise HTTPException(status_code=400, detail="Insufficient leave balance")

    req = LeaveRequest(
        employee_id=employee_id,
        leave_type_id=data.leave_type_id,
        start_date=data.start_date,
        end_date=data.end_date,
        duration_days=duration,
        reason=data.reason,
        status=LeaveStatus.PENDING,
        attachment_path=attachment_path,
        attachment_name=attachment_name,
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


def decide(
    db: Session, request_id: int, approve: bool, reviewer_id: int, note: str | None
) -> LeaveRequest:
    req = db.get(LeaveRequest, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Leave request not found")
    if req.status != LeaveStatus.PENDING:
        raise HTTPException(status_code=400, detail="Request already processed")

    req.status = LeaveStatus.APPROVED if approve else LeaveStatus.REJECTED
    req.reviewed_by = reviewer_id
    req.reviewed_at = datetime.utcnow()
    req.review_note = note

    if approve and req.leave_type.is_paid:
        bal = get_or_create_balance(db, req.employee_id, req.leave_type_id, req.start_date.year)
        bal.used_days += req.duration_days
        # Mark attendance as on_leave for those dates
        cur = req.start_date
        while cur <= req.end_date:
            if cur.weekday() < 5:
                existing = db.scalar(
                    select(AttendanceRecord).where(
                        AttendanceRecord.employee_id == req.employee_id,
                        AttendanceRecord.date == cur,
                    )
                )
                if not existing:
                    db.add(AttendanceRecord(
                        employee_id=req.employee_id,
                        date=cur,
                        status=AttendanceStatus.ON_LEAVE,
                    ))
            cur += timedelta(days=1)

    db.commit()
    db.refresh(req)
    return req


def stats(db: Session) -> dict:
    rows = db.execute(
        select(LeaveRequest.status)
    ).all()
    counts = {"total": len(rows), "pending": 0, "approved": 0, "rejected": 0}
    for (st,) in rows:
        counts[st.value] += 1
    return counts