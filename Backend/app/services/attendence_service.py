from datetime import date, datetime, time, timedelta

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import AttendanceRecord, Employee
from app.models.enums import AttendanceStatus


def _today_record(db: Session, employee_id: int, day: date) -> AttendanceRecord | None:
    return db.scalar(
        select(AttendanceRecord).where(
            AttendanceRecord.employee_id == employee_id,
            AttendanceRecord.date == day,
        )
    )


def check_in(db: Session, employee_id: int) -> AttendanceRecord:
    today = date.today()
    record = _today_record(db, employee_id, today)
    if record and record.check_in_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already checked in today")
    now = datetime.now()
    if not record:
        record = AttendanceRecord(
            employee_id=employee_id,
            date=today,
            check_in_at=now,
            status=AttendanceStatus.PRESENT,
        )
        db.add(record)
    else:
        record.check_in_at = now
        record.status = AttendanceStatus.PRESENT
    db.commit()
    db.refresh(record)
    return record


def check_out(db: Session, employee_id: int) -> AttendanceRecord:
    today = date.today()
    record = _today_record(db, employee_id, today)
    if not record or not record.check_in_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You have not checked in today")
    if record.check_out_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already checked out")
    now = datetime.now()
    record.check_out_at = now
    delta = now - record.check_in_at
    worked = int(delta.total_seconds() // 60)
    std_minutes = int(settings.standard_hours * 60)
    record.worked_minutes = worked
    record.extra_minutes = max(0, worked - std_minutes)
    record.status = AttendanceStatus.PRESENT
    db.commit()
    db.refresh(record)
    return record


def get_today_status(db: Session, employee_id: int) -> AttendanceRecord | None:
    return _today_record(db, employee_id, date.today())


def get_month_records(db: Session, employee_id: int, year: int, month: int) -> list[AttendanceRecord]:
    start = date(year, month, 1)
    end = (date(year + (month // 12), (month % 12) + 1, 1) - timedelta(days=1))
    return list(db.scalars(
        select(AttendanceRecord)
        .where(
            AttendanceRecord.employee_id == employee_id,
            AttendanceRecord.date >= start,
            AttendanceRecord.date <= end,
        )
        .order_by(AttendanceRecord.date.desc())
    ))


def monthly_summary(db: Session, employee_id: int, year: int, month: int) -> dict:
    records = get_month_records(db, employee_id, year, month)
    return {
        "total_days": len(records),
        "present_days": sum(1 for r in records if r.status == AttendanceStatus.PRESENT),
        "on_leave_days": sum(1 for r in records if r.status == AttendanceStatus.ON_LEAVE),
        "absent_days": sum(1 for r in records if r.status == AttendanceStatus.ABSENT),
        "total_worked_minutes": sum(r.worked_minutes or 0 for r in records),
        "total_extra_minutes": sum(r.extra_minutes or 0 for r in records),
    }


def all_records_query(db: Session):
    return db.execute(
        select(AttendanceRecord, Employee)
        .join(Employee, Employee.id == AttendanceRecord.employee_id)
        .order_by(AttendanceRecord.date.desc())
    ).all()


def employees_today_status(db: Session) -> dict[int, AttendanceStatus | None]:
    today = date.today()
    rows = db.execute(
        select(AttendanceRecord.employee_id, AttendanceRecord.status).where(AttendanceRecord.date == today)
    ).all()
    return {emp_id: st for emp_id, st in rows}