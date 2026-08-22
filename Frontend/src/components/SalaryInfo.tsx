import { useEffect, useState } from "react";
import { Plus, Trash2, Save, Calculator, IndianRupee } from "lucide-react";
import api from "@/services/api";
import type { Salary, SalaryComponent } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Form";
import { useToast } from "@/context/ToastContext";
import { inr } from "@/utils/cn";

const DEFAULT_COMPONENTS = [
  { name: "Basic Salary", base: "wage" as const, percentage: 50, amount: 0 },
  { name: "House Rent Allowance", base: "basic" as const, percentage: 50, amount: 0 },
  { name: "Standard Allowance", base: "wage" as const, percentage: 20, amount: 0 },
  { name: "Performance Bonus", base: "wage" as const, percentage: 5, amount: 0 },
];

export default function SalaryInfo({ employeeId }: { employeeId: number }) {
  const { push } = useToast();
  const [salary, setSalary] = useState<Salary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    wage: 750000,
    working_days: 22,
    working_hours: 8,
    pf_percentage: 12,
    professional_tax: 200,
    components: [...DEFAULT_COMPONENTS] as SalaryComponent[],
  });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/salary/${employeeId}`);
        setSalary(data);
        setForm({
          wage: Number(data.wage),
          working_days: data.working_days,
          working_hours: data.working_hours,
          pf_percentage: data.pf_percentage,
          professional_tax: Number(data.professional_tax),
          components: data.components.length > 0 ? data.components : [...DEFAULT_COMPONENTS],
        });
      } catch {
        // Not configured; use defaults
      } finally { setLoading(false); }
    })();
  }, [employeeId]);

  const basic = form.components.find((c) => c.name.toLowerCase().startsWith("basic"));
  const basicAmount = basic ? (form.wage * basic.percentage) / 100 : 0;

  const computedComponents = form.components.map((c) => {
    let baseValue = form.wage;
    if (c.base === "basic") baseValue = basicAmount;
    if (c.base === "hra") {
      const hra = form.components.find((x) => x.name.toLowerCase().startsWith("house"));
      baseValue = hra ? (form.wage * (hra.percentage || 0)) / 100 : 0;
    }
    return { ...c, amount: Math.round((baseValue * c.percentage) / 100) };
  });

  const totalComponents = computedComponents.reduce((s, c) => s + c.amount, 0);
  const exceedsWage = totalComponents > form.wage;
  const pfAmount = Math.round((form.wage / 12) * (form.pf_percentage / 100));

  const save = async () => {
    if (exceedsWage) { push("error", "Components total exceeds the defined wage."); return; }
    setSaving(true);
    try {
      const { data } = await api.put(`/salary/${employeeId}`, form);
      setSalary(data);
      push("success", "Salary configuration saved successfully.");
    } catch (e: any) {
      push("error", e.response?.data?.detail || "Failed to save salary.");
    } finally { setSaving(false); }
  };

  const addComponent = () => {
    setForm({ ...form, components: [...form.components, { name: "New Component", base: "wage", percentage: 0, amount: 0 }] });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Compensation Configuration" subtitle="Annual CTC and salary structure"
          action={<Button onClick={save} loading={saving}><Save className="h-4 w-4" />Save Changes</Button>}
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label>Annual Wage (CTC)</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input type="number" value={form.wage} onChange={(e) => setForm({ ...form, wage: Number(e.target.value) })} className="pl-9" />
            </div>
          </div>
          <div>
            <Label>Working Days / Month</Label>
            <Input type="number" value={form.working_days} onChange={(e) => setForm({ ...form, working_days: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Working Hours / Day</Label>
            <Input type="number" value={form.working_hours} onChange={(e) => setForm({ ...form, working_hours: Number(e.target.value) })} />
          </div>
          <div>
            <Label>PF Percentage</Label>
            <Input type="number" value={form.pf_percentage} onChange={(e) => setForm({ ...form, pf_percentage: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Professional Tax (₹/month)</Label>
            <Input type="number" value={form.professional_tax} onChange={(e) => setForm({ ...form, professional_tax: Number(e.target.value) })} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <div className="rounded-xl bg-brand-50 p-4">
            <p className="text-xs text-brand-700 font-medium">Annual</p>
            <p className="text-lg font-bold text-brand-900">{inr(form.wage)}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="text-xs text-emerald-700 font-medium">Monthly Gross</p>
            <p className="text-lg font-bold text-emerald-900">{inr(form.wage / 12)}</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-4">
            <p className="text-xs text-amber-700 font-medium">PF (monthly)</p>
            <p className="text-lg font-bold text-amber-900">{inr(pfAmount)}</p>
          </div>
          <div className="rounded-xl bg-rose-50 p-4">
            <p className="text-xs text-rose-700 font-medium">Prof. Tax</p>
            <p className="text-lg font-bold text-rose-900">{inr(form.professional_tax)}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Salary Components" subtitle="Percentage-based — recalculates automatically"
          action={<Button variant="secondary" size="sm" onClick={addComponent}><Plus className="h-4 w-4" /> Add Component</Button>}
        />
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-y border-slate-100">
                <th className="px-5 py-3 font-medium">Component</th>
                <th className="px-3 py-3 font-medium">Based On</th>
                <th className="px-3 py-3 font-medium">Percentage</th>
                <th className="px-3 py-3 font-medium text-right">Amount</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {computedComponents.map((c, i) => (
                <tr key={i} className="border-b border-slate-50">
                  <td className="px-5 py-2.5">
                    <Input value={c.name} onChange={(e) => {
                      const comps = [...form.components]; comps[i] = { ...comps[i], name: e.target.value };
                      setForm({ ...form, components: comps });
                    }} />
                  </td>
                  <td className="px-3 py-2.5">
                    <Select value={c.base} onChange={(e) => {
                      const comps = [...form.components]; comps[i] = { ...comps[i], base: e.target.value as any };
                      setForm({ ...form, components: comps });
                    }}>
                      <option value="wage">Wage</option>
                      <option value="basic">Basic</option>
                      <option value="hra">HRA</option>
                    </Select>
                  </td>
                  <td className="px-3 py-2.5 w-32">
                    <Input type="number" value={c.percentage} onChange={(e) => {
                      const comps = [...form.components]; comps[i] = { ...comps[i], percentage: Number(e.target.value) };
                      setForm({ ...form, components: comps });
                    }} />
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{inr(c.amount)}</td>
                  <td className="px-5 py-2.5 text-right">
                    <button onClick={() => setForm({ ...form, components: form.components.filter((_, idx) => idx !== i) })}
                      className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td colSpan={3} className="px-5 py-4 text-right text-slate-700">Total Components</td>
                <td className={`px-3 py-4 text-right tabular-nums ${exceedsWage ? "text-red-600" : "text-slate-900"}`}>{inr(totalComponents)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
        {exceedsWage && (
          <p className="text-sm text-red-600 mt-3 flex items-center gap-1.5">
            <Calculator className="h-4 w-4" /> Components total exceeds the defined wage ({inr(form.wage)}). Please adjust.
          </p>
        )}
      </Card>
    </div>
  );
}