export type Role = "employee" | "hr_officer" | "admin";

export interface User {
  id: number;
  email: string;
  role: Role;
  employee_id?: number;
}

export interface Employee {
  id: number;
  employee_code: string;
  login_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department_id?: number;
  position?: string;
  date_of_joining?: string;
}

export interface Attendance {
  id: number;
  employee_id: number;
  date: string;
  check_in?: string;
  check_out?: string;
  work_hours?: number;
  extra_hours?: number;
  status: string;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  duration: number;
  reason?: string;
  status: "pending" | "approved" | "rejected";
}

export interface Salary {
  id: number;
  employee_id: number;
  wage: number;
  basic_salary?: number;
  hra?: number;
  standard_allowance?: number;
  performance_bonus?: number;
  fixed_allowance?: number;
  pf_percentage?: number;
  professional_tax?: number;
}