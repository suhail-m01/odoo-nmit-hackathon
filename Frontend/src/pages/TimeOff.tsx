import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus, CalendarDays, FileText, Check, X, Eye, UploadCloud,
  Plane, HeartPulse, Wallet, Clock,
} from "lucide-react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import type { LeaveBalance, LeaveRequest, LeaveType } from "@/types";
import StatCard from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Input, Label, Select, Textarea, Field } from "@/components/ui/Form";
import { PageLoader, EmptyState } from "@/components/ui/Feedback";
import { format } from "date-fns";

export default function TimeOff() {
  const { user } = useAuth();
  const { push } = useToast();
  const isHR = user?.role === "hr_officer" || user?.role === "admin";

  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"me" | "approvals">(isHR ? "approvals" : "me");
  const [filter, setFilter] = useState("");

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ leave_type_id: 0, start_date: "", end_date: "", reason: "" });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [decision, setDecision] = useState<{ id: number; action: "approve" | "reject" } | null>(null);
  const [detail, setDetail] = useState<LeaveRequest | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [bRes, tRes] = await Promise.all([
        api.get("/leave/balances"),
        api.get("/leave/types"),
      ]);
      setBalances(bRes.data);
      setTypes(tRes.data);

      if (isHR && tab === "approvals") {
        const [rRes, sRes] = await Promise.all([
          api.get("/leave/requests", { params: filter ? { status: filter } : {} }),
          api.get("/leave/stats"),
        ]);
        setRequests(rRes.data.items);
        setStats(sRes.data);
      } else {
        const { data } = await api.get("/leave/requests");
        setRequests(data.items);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tab, filter]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.leave_type_id || !form.start_date || !form.end_date) {
      push("error", "Please fill all required fields."); return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("leave_type_id", String(form.leave_type_id));
      fd.append("start_date", form.start_date);
      fd.append("end_date", form.end_date);
      if (form.reason) fd.append("reason", form.reason);
      if (file) fd.append("attachment", file);
      await api.post("/leave/requests", fd);
      push("success", "Leave request submitted!");
      setOpen(false);
      setForm({ leave_type_id: 0, start_date: "", end_date: "", reason: "" });
      setFile(null);
      load();
    } catch (e: any) {
      push("error", e.response?.data?.detail || "Failed to submit request");
    } finally { setSubmitting(false); }
  };

  const decide = async () => {
    if (!decision) return;
    try {
      await api.post(`/leave/requests/${decision.id}/${decision.action}`, { note: null });
      push("success", `Request ${decision.action === "approve" ? "approved" : "rejected"}.`);
      setDecision(null);
      load();
    } catch (e: any) {
      push("error", e.response?.data?.detail || "Action failed");
    }
  };

  if (loading) return <PageLoader />;

  const sickType = types.find((t) => t.code === "sick");
  const requiresAttachment = sickType && form.leave_type_id === sickType.id;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Time Off</h1>
          <p className="text-slate-500 mt-1">Manage your leaves and approvals</p>
        </div>
        <div className="flex gap-2">
          {isHR && (
            <div className="flex bg-white rounded-xl border border-slate-200 p-1">
              <button onClick={() => setTab("me")} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${tab === "me" ? "bg-brand-600 text-white" : "text-slate-600"}`}>My Leaves</button>
              <button onClick={() => setTab("approvals")} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${tab === "approvals" ? "bg-brand-600 text-white" : "text-slate-600"}`}>Approvals</button>
            </div>
          )}
          <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New Request</Button>
        </div>
      </div>

      {/* Balances */}
      {tab === "me" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {balances.map((b, i) => {
            const icons = { pto: Plane, sick: HeartPulse, unpaid: Wallet };
            const colors: any = { pto: "indigo", sick: "emerald", unpaid: "slate" };
            const Icon = (icons as any)[b.leave_type.code] || CalendarDays;
            return (
              <StatCard
                key={b.id}
                index={i}
                label={b.leave_type.name}
                value={`${b.balance_days - b.used_days} days`}
                hint={`${b.used_days} used of ${b.balance_days}`}
                accent={colors[b.leave_type.code] || "indigo"}
                icon={<Icon className="h-5 w-5" />}
              />
            );
          })}
        </div>
      )}

      {/* HR Stats */}
      {tab === "approvals" && stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Requests" value={stats.total} icon={<CalendarDays className="h-5 w-5" />} accent="indigo" />
          <StatCard label="Pending" value={stats.pending} icon={<Clock className="h-5 w-5" />} accent="amber" />
          <StatCard label="Approved" value={stats.approved} icon={<Check className="h-5 w-5" />} accent="emerald" />
          <StatCard label="Rejected" value={stats.rejected} icon={<X className="h-5 w-5" />} accent="rose" />
        </div>
      )}

      <Card>
        <CardHeader title={tab === "me" ? "My Leave Requests" : "Pending Approvals"}
          action={
            <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-40">
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </Select>
          }
        />
        {requests.length === 0 ? (
          <EmptyState icon={<CalendarDays className="h-7 w-7" />} title="No leave requests" description="New requests will appear here." />
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-y border-slate-100">
                  {tab === "approvals" && <th className="px-5 py-3 font-medium">Employee</th>}
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-3 py-3 font-medium">From</th>
                  <th className="px-3 py-3 font-medium">To</th>
                  <th className="px-3 py-3 font-medium">Duration</th>
                  <th className="px-3 py-3 font-medium">Attachment</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {requests.map((r, i) => (
                  <motion.tr key={r.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * .03 }}
                    className="border-b border-slate-50 hover:bg-slate-50/70 transition">
                    {tab === "approvals" && <td className="px-5 py-3"><p className="font-medium text-slate-900">{r.employee_name}</p><p className="text-xs text-slate-500 font-mono">{r.employee_code}</p></td>}
                    <td className="px-5 py-3 font-medium">{r.leave_type?.name}</td>
                    <td className="px-3 py-3 text-slate-600">{format(new Date(r.start_date), "MMM d, yyyy")}</td>
                    <td className="px-3 py-3 text-slate-600">{format(new Date(r.end_date), "MMM d, yyyy")}</td>
                    <td className="px-3 py-3 tabular-nums font-medium">{r.duration_days}d</td>
                    <td className="px-3 py-3">{r.attachment_name ? <Badge tone="blue"><FileText className="h-3 w-3" /> Yes</Badge> : "—"}</td>
                    <td className="px-3 py-3">
                      {r.status === "pending" && <Badge tone="amber">Pending</Badge>}
                      {r.status === "approved" && <Badge tone="green">Approved</Badge>}
                      {r.status === "rejected" && <Badge tone="red">Rejected</Badge>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setDetail(r)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition">
                          <Eye className="h-4 w-4" />
                        </button>
                        {tab === "approvals" && r.status === "pending" && (
                          <>
                            <button onClick={() => setDecision({ id: r.id, action: "approve" })} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition">
                              <Check className="h-4 w-4" />
                            </button>
                            <button onClick={() => setDecision({ id: r.id, action: "reject" })} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition">
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* New request modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="New Leave Request">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Leave Type" required>
            <Select value={form.leave_type_id} onChange={(e) => setForm({ ...form, leave_type_id: Number(e.target.value) })}>
              <option value={0}>Select type...</option>
              {types.map((t) => <option key={t.id} value={t.id}>{t.name}{t.requires_attachment ? " (certificate required)" : ""}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date" required>
              <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
            </Field>
            <Field label="End Date" required>
              <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required />
            </Field>
          </div>
          <Field label="Reason">
            <Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Brief reason for your leave..." />
          </Field>
          {requiresAttachment && (
            <Field label="Medical Certificate" required>
              <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-brand-400 hover:bg-brand-50/40 transition">
                <UploadCloud className="h-7 w-7 text-slate-400" />
                <p className="text-sm text-slate-600">{file ? file.name : "Click to upload certificate"}</p>
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>
            </Field>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Submit Request</Button>
          </div>
        </form>
      </Modal>

      {/* Detail modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Leave Request Details" size="md">
        {detail && (
          <div className="space-y-4">
            {tab === "approvals" && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-white grid place-items-center font-bold text-sm">
                  {detail.employee_name?.split(" ").map(p => p[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{detail.employee_name}</p>
                  <p className="text-xs text-slate-500 font-mono">{detail.employee_code}</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-slate-500">Type</p><p className="font-semibold">{detail.leave_type?.name}</p></div>
              <div><p className="text-slate-500">Status</p>
                {detail.status === "pending" && <Badge tone="amber">Pending</Badge>}
                {detail.status === "approved" && <Badge tone="green">Approved</Badge>}
                {detail.status === "rejected" && <Badge tone="red">Rejected</Badge>}
              </div>
              <div><p className="text-slate-500">From</p><p className="font-semibold">{format(new Date(detail.start_date), "MMM d, yyyy")}</p></div>
              <div><p className="text-slate-500">To</p><p className="font-semibold">{format(new Date(detail.end_date), "MMM d, yyyy")}</p></div>
              <div><p className="text-slate-500">Duration</p><p className="font-semibold">{detail.duration_days} business days</p></div>
              <div><p className="text-slate-500">Submitted</p><p className="font-semibold">{format(new Date(detail.created_at), "MMM d, yyyy")}</p></div>
            </div>
            {detail.reason && (
              <div>
                <p className="text-slate-500 text-sm mb-1">Reason</p>
                <p className="text-sm bg-slate-50 rounded-xl p-3">{detail.reason}</p>
              </div>
            )}
            {detail.review_note && (
              <div>
                <p className="text-slate-500 text-sm mb-1">Review Note</p>
                <p className="text-sm bg-slate-50 rounded-xl p-3">{detail.review_note}</p>
              </div>
            )}
            {detail.attachment_name && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-sky-50 text-sky-700 text-sm">
                <FileText className="h-4 w-4" /> {detail.attachment_name}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm */}
      <ConfirmDialog
        open={!!decision}
        onClose={() => setDecision(null)}
        onConfirm={decide}
        title={decision?.action === "approve" ? "Approve Leave Request" : "Reject Leave Request"}
        description={decision?.action === "approve"
          ? "This will approve the request, deduct leave balance, and mark attendance accordingly."
          : "This will reject the leave request. The employee will be notified."}
        confirmText={decision?.action === "approve" ? "Approve" : "Reject"}
        danger={decision?.action === "reject"}
      />
    </div>
  );
}