import { useEffect, useState, type ReactNode } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatMinutes } from "../utils/cn";

const PageLoader = () => (
  <div className="flex min-h-32 items-center justify-center" role="status" aria-label="Loading">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
  </div>
);

type EmptyStateProps = {
  title: string;
  description?: string;
};

const EmptyState = ({ title, description }: EmptyStateProps) => (
  <div className="py-10 text-center">
    <p className="font-medium text-slate-900">{title}</p>
    {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
  </div>
);

type IconProps = { className?: string };

type BadgeProps = {
  children: ReactNode;
  tone: "green" | "amber" | "red";
};

const Badge = ({ children, tone }: BadgeProps) => {
  const toneClasses = {
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-rose-50 text-rose-700",
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}>
      {children}
    </span>
  );
};

type CardProps = {
  children: ReactNode;
  className?: string;
};

const Card = ({ children, className = "" }: CardProps) => (
  <section className={`rounded-2xl border border-slate-200 bg-white p-5 ${className}`}>
    {children}
  </section>
);

type CardHeaderProps = {
  title: string;
  subtitle?: string;
};

const CardHeader = ({ title, subtitle }: CardHeaderProps) => (
  <div className="mb-5">
    <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
    {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
  </div>
);

const ChevronLeft = ({ className }: IconProps) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>;
const ChevronRight = ({ className }: IconProps) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>;
const Clock = ({ className }: IconProps) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
const CalendarCheck = ({ className }: IconProps) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M8 15l2 2 5-5" /></svg>;
const CalendarX = ({ className }: IconProps) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M9 15l6 4M15 15l-6 4" /></svg>;
const Hourglass = ({ className }: IconProps) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 3h14M5 21h14M6 3c0 5 6 6 6 9s-6 4-6 9M18 3c0 5-6 6-6 9s6 4 6 9" /></svg>;

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

type StatCardProps = {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent: "emerald" | "amber" | "indigo" | "rose";
};

const StatCard = ({ label, value, icon, accent }: StatCardProps) => {
  const accentClasses = {
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    indigo: "bg-indigo-50 text-indigo-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${accentClasses[accent]}`}>
        {icon}
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
};

export default function Attendance() {
  const { user } = useAuth();
  const isHR = user?.role === "hr_officer" || user?.role === "admin";
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [records, setRecords] = useState<any[]>([]);
  const [allRecords, setAllRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"me" | "all">(isHR ? "all" : "me");

  const load = async () => {
    setLoading(true);
    try {
      if (view === "me") {
        const { data } = await api.get("/attendance/me", { params: { year, month } });
        setRecords(data.records);
        setSummary(data.summary);
      } else {
        const { data } = await api.get("/attendance/all", { params: { year, month } });
        setAllRecords(data.items);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [year, month, view]);

  const prev = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance</h1>
          <p className="text-slate-500 mt-1">{MONTHS[month - 1]} {year}</p>
        </div>
        <div className="flex items-center gap-2">
          {isHR && (
            <div className="flex bg-white rounded-xl border border-slate-200 p-1">
              <button onClick={() => setView("me")} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${view === "me" ? "bg-brand-600 text-white" : "text-slate-600"}`}>My Attendance</button>
              <button onClick={() => setView("all")} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${view === "all" ? "bg-brand-600 text-white" : "text-slate-600"}`}>All Employees</button>
            </div>
          )}
          <button onClick={prev} className="h-10 w-10 grid place-items-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={next} className="h-10 w-10 grid place-items-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      {view === "me" && summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Present Days" value={summary.present_days} icon={<CalendarCheck className="h-5 w-5" />} accent="emerald" />
          <StatCard label="On Leave" value={summary.on_leave_days} icon={<Clock className="h-5 w-5" />} accent="amber" />
          <StatCard label="Worked Hours" value={formatMinutes(summary.total_worked_minutes)} icon={<Hourglass className="h-5 w-5" />} accent="indigo" />
          <StatCard label="Extra Hours" value={formatMinutes(summary.total_extra_minutes)} icon={<CalendarX className="h-5 w-5" />} accent="rose" />
        </div>
      )}

      <Card>
        <CardHeader title={view === "me" ? "My Attendance Records" : "All Attendance Records"} subtitle="Check-in, check-out, and work hours" />
        {loading ? <PageLoader /> :
         (view === "me" ? records : allRecords).length === 0 ? (
          <EmptyState title="No attendance records" description="Records will appear here once you check in." />
         ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-y border-slate-100">
                  <th className="px-5 py-3 font-medium">Date</th>
                  {view === "all" && <th className="px-3 py-3 font-medium">Employee</th>}
                  <th className="px-3 py-3 font-medium">Check In</th>
                  <th className="px-3 py-3 font-medium">Check Out</th>
                  <th className="px-3 py-3 font-medium">Work Hours</th>
                  <th className="px-3 py-3 font-medium">Extra</th>
                  <th className="px-5 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {(view === "me" ? records : allRecords).map((r: any, i: number) => (
                  <tr key={r.id}
                    className="border-b border-slate-50 hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3 font-medium">{new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" })}</td>
                    {view === "all" && <td className="px-3 py-3">{r.employee_name}</td>}
                    <td className="px-3 py-3 tabular-nums text-slate-600">{r.check_in_at ? new Date(r.check_in_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                    <td className="px-3 py-3 tabular-nums text-slate-600">{r.check_out_at ? new Date(r.check_out_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                    <td className="px-3 py-3 font-medium tabular-nums">{formatMinutes(r.worked_minutes)}</td>
                    <td className="px-3 py-3 tabular-nums text-amber-600 font-medium">{formatMinutes(r.extra_minutes)}</td>
                    <td className="px-5 py-3 text-right">
                      {r.status === "present" && <Badge tone="green">Present</Badge>}
                      {r.status === "on_leave" && <Badge tone="amber">On Leave</Badge>}
                      {r.status === "absent" && <Badge tone="red">Absent</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
