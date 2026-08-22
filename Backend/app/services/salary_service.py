from datetime import date

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Salary, SalaryComponent
from app.schemas.salary import SalaryIn


def recalculate(salary: Salary) -> Salary:
    basic_amount = 0.0
    hra_amount = 0.0
    total_components = 0.0

    for comp in salary.components:
        base_value = float(salary.wage)
        if comp.base == "basic":
            base_value = basic_amount
        elif comp.base == "hra":
            base_value = hra_amount
        amount = round(base_value * comp.percentage / 100, 2)
        comp.amount = amount
        total_components += amount
        if comp.name.lower().startswith("basic"):
            basic_amount = amount
        elif comp.name.lower().startswith("house") or comp.name.lower() == "hra":
            hra_amount = amount

    if total_components > float(salary.wage) + 0.01:
        raise HTTPException(status_code=400, detail="Total salary components exceed the defined wage")

    salary.yearly_wage = float(salary.wage)
    salary.monthly_wage = round(float(salary.wage) / 12, 2)
    return salary


def upsert_salary(db: Session, employee_id: int, data: SalaryIn) -> Salary:
    salary = db.scalar(select(Salary).where(Salary.employee_id == employee_id))
    if not salary:
        salary = Salary(employee_id=employee_id, effective_date=date.today())
        db.add(salary)
        db.flush()

    salary.wage = data.wage
    salary.working_days = data.working_days
    salary.working_hours = data.working_hours
    salary.pf_percentage = data.pf_percentage
    salary.professional_tax = data.professional_tax

    # Replace components
    salary.components.clear()
    db.flush()
    for c in data.components:
        salary.components.append(SalaryComponent(
            name=c.name, base=c.base, percentage=c.percentage, amount=0,
        ))

    recalculate(salary)
    db.commit()
    db.refresh(salary)
    return salary


def get_salary(db: Session, employee_id: int) -> Salary | None:
    return db.scalar(select(Salary).where(Salary.employee_id == employee_id))