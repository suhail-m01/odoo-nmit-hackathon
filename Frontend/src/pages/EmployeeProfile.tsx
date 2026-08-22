import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Mail, Phone, MapPin, Briefcase, Calendar, User as UserIcon,
  Shield, Building2, CreditCard, Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/services/api";
import type { Employee, Salary, User } from "@/types";
import { useAuth } from "@/context/AuthContext";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Feedback";
import { cn, inr } from "@/utils/cn";
import SalaryInfo from "@/components/SalaryInfo";

const tabs = [
  { id: "resume", label: "Resume", icon: UserIcon },
  { id: "private", label: "Private Info", icon: UserIcon },
  { id: "salary", label: "Salary Info", icon: Wallet, adminOnly: true },
  { id: "security", label: "Security", icon: Shield },
];

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-3 border-b border-slate-100 last:border-0 flex justify-between gap-4">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900 text-right">{value || "—"}</span>
    </div>
  );
}

export default function EmployeeProfile() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("resume");

  const isAdmin = user?.role === "admin";
  const visibleTabs = tabs.filter(t => !t.adminOnly || isAdmin);
  const targetId = id || user?.employee_id;

  useEffect(() => {
    if (!targetId) { setLoading(false); return; }
    (async () => {
      try {
        const { data } = await api.get(`/employees/${targetId}`);
        setEmployee(data);
      } finally { setLoading(false); }
    })();
  }, [targetId]);

  if (loading || !employee) return <PageLoader />;

  const name = `${employee.first_name} ${employee.last_name}`;

  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" size="sm" onClick={() => nav(-1)}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar name={name} size={80} />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
              <Badge tone="violet">{employee.job_title}</Badge>
              {employee.is_active ? <Badge tone="green">Active</Badge> : <Badge tone="gray">Inactive</Badge>}
            </div>
            <p className="text-slate-500 mt-1 font-mono text-sm">{employee.employee_code}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 text-sm text-slate-600">
              <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-slate-400" />{employee.personal_email}</span>
              <span className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-slate-400" />{employee.mobile}</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-slate-400" />{employee.location}</span>
              <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4 text-slate-400" />{employee.department?.name}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-1 overflow-x-auto">
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap",
              tab === t.id
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-slate-500 hover:text-slate-900",
            )}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        {tab === "resume" && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-semibold mb-2">Employment Details</h3>
              <InfoRow label="Job Title" value={employee.job_title} />
              <InfoRow label="Department" value={employee.department?.name} />
              <InfoRow label="Employee Code" value={employee.employee_code} />
              <InfoRow label="Date of Joining" value={new Date(employee.date_of_joining).toLocaleDateString()} />
              <InfoRow label="Location" value={employee.location} />
            </Card>
            <Card>
              <h3 className="font-semibold mb-2">Contact</h3>
              <InfoRow label="Email" value={employee.personal_email} />
              <InfoRow label="Mobile" value={employee.mobile} />
              <InfoRow label="Nationality" value={employee.nationality} />
            </Card>
          </div>
        )}

        {tab === "private" && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-semibold mb-2">Personal Information</h3>
              <InfoRow label="Gender" value={employee.gender} />
              <InfoRow label="Marital Status" value={employee.marital_status} />
              <InfoRow label="Date of Birth" value={employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString() : null} />
              <InfoRow label="Nationality" value={employee.nationality} />
              <InfoRow label="Address" value={employee.residential_address} />
            </Card>
            <Card>
              <h3 className="font-semibold mb-2">Banking & Identification</h3>
              <InfoRow label="Bank" value={employee.bank_name} />
              <InfoRow label="Account Number" value={employee.bank_account_number} />
              <InfoRow label="IFSC" value={employee.ifsc_code} />
              <InfoRow label="PAN" value={employee.pan} />
              <InfoRow label="UAN" value={employee.uan} />
            </Card>
          </div>
        )}

        {tab === "salary" && isAdmin && <SalaryInfo employeeId={employee.id} />}
        {/* note: targetId used when route is /profile */}
        <span className="hidden">{targetId}</span>

        {tab === "security" && (
          <Card>
            <h3 className="font-semibold mb-4">Security Settings</h3>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
              <Shield className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Password protected</p>
                <p className="text-xs text-slate-500">Change your password regularly to keep your account secure.</p>
              </div>
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
}