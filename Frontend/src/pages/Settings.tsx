import { Building2, Percent, IndianRupee, Clock } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input, Label, Field } from "@/components/ui/Form";

export default function Settings() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1">System configuration and defaults.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Company Settings" subtitle="Organization details" />
          <div className="space-y-4">
            <Field label="Company Prefix (for Employee IDs)"><Input defaultValue="OI" /></Field>
            <Field label="Organization Name"><Input defaultValue="Odoo Industries" /></Field>
          </div>
        </Card>
        <Card>
          <CardHeader title="Payroll Defaults" subtitle="Applied to new salary configurations" />
          <div className="space-y-4">
            <Field label="PF Percentage (%)"><div className="relative"><Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input type="number" defaultValue={12} /></div></Field>
            <Field label="Professional Tax (₹/month)"><div className="relative"><IndianRupee className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input type="number" defaultValue={200} /></div></Field>
            <Field label="Standard Working Hours / Day"><div className="relative"><Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input type="number" defaultValue={8} /></div></Field>
          </div>
        </Card>
      </div>

      <div className="card p-5 flex items-center gap-3 text-sm text-slate-600">
        <Building2 className="h-5 w-5 text-brand-600" />
        Settings are editable by administrators only. Changes affect future records.
      </div>
    </div>
  );
}
