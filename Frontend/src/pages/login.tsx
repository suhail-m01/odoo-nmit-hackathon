import { useState } from "react";
import { useAuth } from "../context/AuthContext";
type IconProps = React.SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const Building2 = (props: IconProps) => <Icon {...props}><path d="M3 21h18M6 21V5l6-3 6 3v16M9 9h1M14 9h1M9 13h1M14 13h1M9 17h1M14 17h1" /></Icon>;
const Clock = (props: IconProps) => <Icon {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>;
const CalendarDays = (props: IconProps) => <Icon {...props}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></Icon>;
const ShieldCheck = (props: IconProps) => <Icon {...props}><path d="M12 3 20 6v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z" /><path d="m9 12 2 2 4-4" /></Icon>;
const Mail = (props: IconProps) => <Icon {...props}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></Icon>;
const Lock = (props: IconProps) => <Icon {...props}><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></Icon>;
const ArrowRight = (props: IconProps) => <Icon {...props}><path d="M5 12h14M13 6l6 6-6 6" /></Icon>;

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-slate-700 mb-2">{children}</label>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${props.className}`} />;
}

type LoginButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  size?: "lg";
};

function Button({ loading, size, className = "", children, disabled, ...props }: LoginButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 ${size === "lg" ? "min-h-12" : ""} ${className}`}
    >
      {loading ? "Signing in..." : children}
    </button>
  );
}

const demoAccounts = [
  { email: "admin@hrms.io", password: "admin123", label: "Admin", color: "from-violet-500 to-indigo-600" },
  { email: "hr@hrms.io", password: "hr12345", label: "HR Officer", color: "from-sky-500 to-cyan-600" },
  { email: "john@hrms.io", password: "emp12345", label: "Employee", color: "from-emerald-500 to-teal-600" },
];

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("john@hrms.io");
  const [password, setPassword] = useState("emp12345");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      window.location.href = "/dashboard";
    } catch (err: any) {
      window.alert(err.response?.data?.detail || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (a: typeof demoAccounts[0]) => {
    setEmail(a.email);
    setPassword(a.password);
  };

  return (
    <div className="min-h-screen day-bg flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden p-12 flex-col justify-between">
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 grid place-items-center text-white shadow-xl shadow-brand-500/30">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold text-xl text-slate-900">HRMS</p>
            <p className="text-xs text-slate-500">Modern Workforce Platform</p>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl xl:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
            Manage your team,<br />
            <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">beautifully.</span>
          </h1>
          <p className="text-slate-600 mt-5 max-w-md text-lg">
            Attendance, leave, and payroll — unified in one modern platform built for teams that move fast.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
            {[
              { icon: <Clock className="h-5 w-5" />, label: "Live Attendance" },
              { icon: <CalendarDays className="h-5 w-5" />, label: "Smart Leaves" },
              { icon: <ShieldCheck className="h-5 w-5" />, label: "Secure Roles" },
            ].map((f) => (
              <div key={f.label} className="card p-4 flex flex-col items-center text-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-brand-50 text-brand-600 grid place-items-center">{f.icon}</div>
                <p className="text-xs font-semibold text-slate-700">{f.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-gradient-to-br from-brand-300/40 to-violet-300/30 blur-3xl" />
        <div className="absolute top-1/3 right-0 h-64 w-64 rounded-full bg-gradient-to-br from-sky-300/30 to-cyan-200/20 blur-3xl" />
        <p className="text-xs text-slate-400 relative z-10">© 2026 HRMS • Odoo x NMIT Bangalore Hackathon</p>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 grid place-items-center text-white shadow-lg shadow-brand-500/30">
              <Building2 className="h-6 w-6" />
            </div>
            <p className="font-bold text-xl text-slate-900">HRMS</p>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
          <p className="text-slate-500 mt-2">Sign in to continue to your dashboard.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="pl-10" placeholder="you@company.com" />
              </div>
            </div>
            <div>
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="pl-10" placeholder="••••••••" />
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Sign In <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Quick demo accounts</p>
            <div className="grid gap-2">
              {demoAccounts.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => quickLogin(a)}
                  className="group flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-brand-300 hover:shadow-sm transition text-left"
                >
                  <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${a.color} text-white grid place-items-center text-xs font-bold`}>
                    {a.label[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{a.label}</p>
                    <p className="text-xs text-slate-500 truncate">{a.email} • {a.password}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
