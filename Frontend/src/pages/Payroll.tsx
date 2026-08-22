import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, Users as UsersIcon } from "lucide-react";
import api from "@/services/api";
import type { EmployeeListItem } from "@/types";
import { Card } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import { PageLoader, EmptyState } from "@/components/ui/Feedback";
import { Input } from "@/components/ui/Form";
import { Search } from "lucide-react";

export default function Payroll() {
  const nav = useNavigate();
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/employees", { params: { page_size: 100 } });
        setEmployees(data.items);
      } finally { setLoading(false); }
    })();
  }, []);

  const filtered = employees.filter((e) =>
    `${e.first_name} ${e.last_name} ${e.employee_code}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payroll</h1>
        <p className="text-slate-500 mt-1">Configure salary structures and compensation for employees.</p>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees..." className="pl-10" />
        </div>
      </Card>

      {loading ? <PageLoader /> : filtered.length === 0 ? (
        <Card><EmptyState icon={<UsersIcon className="h-7 w-7" />} title="No employees found" /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((e) => {
            const name = `${e.first_name} ${e.last_name}`;
            return (
              <button key={e.id} onClick={() => nav(`/employees/${e.id}?tab=salary`)}
                className="card p-5 text-left group hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="flex items-center gap-3">
                  <Avatar name={name} size={44} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 group-hover:text-brand-600 transition truncate">{name}</p>
                    <p className="text-xs text-slate-500 truncate">{e.job_title}</p>
                  </div>
                  <Wallet className="h-5 w-5 text-slate-300 group-hover:text-brand-500 transition" />
                </div>
                <p className="mt-3 text-xs font-mono text-slate-400">{e.employee_code}</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
