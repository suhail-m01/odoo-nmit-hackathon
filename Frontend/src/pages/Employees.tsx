import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Users, Plus, Mail, MapPin, Briefcase, Filter } from "lucide-react";
import api from "@/services/api";
import type { EmployeeListItem } from "@/types";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Form";
import { PageLoader, EmptyState, Skeleton } from "@/components/ui/Feedback";
import { useDebounce } from "@/hooks/useDebounce";

function statusDot(status: string | null) {
  if (status === "present") return { tone: "green" as const, label: "Present", dot: "bg-emerald-500" };
  if (status === "on_leave") return { tone: "amber" as const, label: "On Leave", dot: "bg-amber-500" };
  return { tone: "red" as const, label: "Absent", dot: "bg-red-500" };
}

export default function Employees() {
  const nav = useNavigate();
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const debounced = useDebounce(search, 300);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/employees", { params: { search: debounced, status, page, page_size: 12 } });
      setEmployees(data.items);
      setTotal(data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [debounced, status, page]);

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employees</h1>
          <p className="text-slate-500 mt-1">{total} team members across the organization</p>
        </div>
        <Button onClick={() => nav("/employees/new")}><Plus className="h-4 w-4" /> Add Employee</Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, ID, title or email..." className="pl-10" />
          </div>
          <div className="flex items-center gap-2 sm:w-56">
            <Filter className="h-4 w-4 text-slate-400" />
            <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="flex-1">
              <option value="">All statuses</option>
              <option value="present">Present</option>
              <option value="on_leave">On Leave</option>
              <option value="absent">Absent</option>
            </Select>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : employees.length === 0 ? (
        <Card><EmptyState icon={<Users className="h-7 w-7" />} title="No employees found" description="Try adjusting your search or filters." /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {employees.map((e, i) => {
            const s = statusDot(e.today_status);
            const name = `${e.first_name} ${e.last_name}`;
            return (
              <motion.button
                key={e.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * .04 }}
                whileHover={{ y: -3 }}
                onClick={() => nav(`/employees/${e.id}`)}
                className="card p-5 text-left group hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar name={name} size={52} />
                    <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-white ${s.dot}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate group-hover:text-brand-600 transition">{name}</p>
                        <p className="text-sm text-slate-500 truncate flex items-center gap-1"><Briefcase className="h-3 w-3" />{e.job_title}</p>
                      </div>
                      <Badge tone={s.tone}>{s.label}</Badge>
                    </div>
                    <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                      <p className="flex items-center gap-1.5 truncate"><Mail className="h-3.5 w-3.5 shrink-0" />{e.personal_email || "—"}</p>
                      <p className="flex items-center gap-1.5 truncate"><MapPin className="h-3.5 w-3.5 shrink-0" />{e.location || "—"}</p>
                    </div>
                    <p className="mt-3 text-[11px] font-mono text-slate-400">{e.employee_code}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="px-4 py-2 text-sm text-slate-600">Page {page} of {totalPages}</span>
          <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}