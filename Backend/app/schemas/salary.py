from datetime import date
from pydantic import BaseModel, Field


class SalaryComponentIn(BaseModel):
    name: str
    base: str = Field(pattern="^(wage|basic|hra)$")
    percentage: float = Field(ge=0, le=100)


class SalaryComponentOut(SalaryComponentIn):
    id: int
    amount: float

    class Config:
        from_attributes = True


class SalaryIn(BaseModel):
    wage: float = Field(ge=0)
    working_days: int = Field(ge=0, le=31)
    working_hours: float = Field(ge=0, le=24)
    pf_percentage: float = Field(ge=0, le=100)
    professional_tax: float = Field(ge=0)
    components: list[SalaryComponentIn]


class SalaryOut(BaseModel):
    id: int
    employee_id: int
    wage: float
    monthly_wage: float
    yearly_wage: float
    working_days: int
    working_hours: float
    pf_percentage: float
    professional_tax: float
    effective_date: date
    components: list[SalaryComponentOut]

    class Config:
        from_attributes = True