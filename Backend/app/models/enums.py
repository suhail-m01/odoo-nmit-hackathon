import enum


class Role(str, enum.Enum):
    EMPLOYEE = "employee"
    HR_OFFICER = "hr_officer"
    ADMIN = "admin"


class AttendanceStatus(str, enum.Enum):
    PRESENT = "present"
    ON_LEAVE = "on_leave"
    ABSENT = "absent"


class LeaveStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class LeaveTypeCode(str, enum.Enum):
    PTO = "pto"
    SICK = "sick"
    UNPAID = "unpaid"