import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "@/services/api";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label, Select, Field } from "@/components/ui/Form";
import type { Department, Role } from "@/types";

export default function NewEmployee() {
  const nav = useNavigate();
  const { push } = useToast();
  const [depts, setDepts] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", password: "",
    personal_email: "", mobile: "", job_title: "Software Engineer",
    location: "Bengaluru", date_of_joining: new Date().toISOString().slice(0, 10),
    gender: "", marital_status: "", nationality: "Indian",
    department_id: 0, role: "employee" as Role,
  });

  useEffect(() => {
    api.get("/employees/departments").then(({ data }) => setDepts(data));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/employees", form);
      push("success", `Employee created — ID: ${data.employee_code}`);
      nav(`/employees/${data.id}`);
    } catch (err: any) {
      push("error", err.response?.data?.detail || "Failed to create employee");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      <Button variant="ghost" size="sm" onClick={() => nav(-1)}><ArrowLeft className="h-4 w-4" /> Back</Button>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Add New Employee</h1>
        <p className="text-slate-500 mt-1">A unique Login ID will be generated automatically.</p>
      </div>
      <form onSubmit={submit}>
        <Card className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="First Name" required><Input required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></Field>
            <Field label="Last Name" required><Input required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></Field>
            <Field label="Login Email" required><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Password" required><Input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
            <Field label="Personal Email"><Input type="email" value={form.personal_email} onChange={(e) => setForm({ ...form, personal_email: e.target.value })} /></Field>
            <Field label="Mobile"><Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></Field>
            <Field label="Job Title"><Input value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} /></Field>
            <Field label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
            <Field label="Date of Joining" required><Input type="date" required value={form.date_of_joining} onChange={(e) => setForm({ ...form, date_of_joining: e.target.value })} /></Field>
            <Field label="Department">
              <Select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: Number(e.target.value) })}>
                <option value={0}>Select...</option>
                {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </Field>
            <Field label="Gender">
              <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select...</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </Select>
            </Field>
            <Field label="Role">
              <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
                <option value="employee">Employee</option>
                <option value="hr_officer">HR Officer</option>
                <option value="admin">Admin</option>
              </Select>
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => nav(-1)}>Cancel</Button>
            <Button type="submit" loading={loading}>Create Employee</Button>
          </div>
        </Card>
      </form>
    </div>
  );
}