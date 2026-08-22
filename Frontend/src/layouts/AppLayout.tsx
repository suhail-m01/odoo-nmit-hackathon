import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, CalendarCheck, CalendarDays, Wallet, Settings,
  LogOut, Menu, X, Search, Bell, ChevronDown, Building2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Avatar from "@/components/ui/Avatar";
import { cn } from "@/utils/cn";
import type { Role } from "@/types";

interface NavItem { to: string; label: string; icon: React.ReactNode; roles: Role[]; }

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, roles: ["employee", "hr_officer", "admin"] },
  { to: "/employees", label: "Employees", icon: <Users className="h-5 w-5" />, roles: ["hr_officer", "admin"] },
  { to: "/attendance", label: "Attendance", icon: <CalendarCheck className="h-5 w-5" />, roles: ["employee", "hr_officer", "admin"] },
  { to: "/time-off", label: "Time Off", icon: <CalendarDays className="h-5 w-5" />, roles: ["employee", "hr_officer", "admin"] },
  { to: "/payroll", label: "Payroll", icon: <Wallet className="h-5 w-5" />, roles: ["admin"] },
  { to: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" />, roles: ["admin"] },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const items = NAV.filter((n) => user && n.roles.includes(user.role));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-slate-100">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 grid place-items-center text-white shadow-lg shadow-brand-500/30">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <p className="font-bold text-slate-900 leading-tight">HRMS</p>
          <p className="text-[11px] text-slate-500 leading-tight">Workforce Platform</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Menu</p>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              isActive
                ? "bg-brand-50 text-brand-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            {({ isActive }) => (
              <>
                <span className={cn(isActive && "text-brand-600")}>{item.icon}</span>
                {item.label}
                {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-600" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const [menu, setMenu] = useState(false);
  const name = user?.full_name || user?.email || "User";
  const roleLabel = user?.role === "admin" ? "Administrator" : user?.role === "hr_officer" ? "HR Officer" : "Employee";

  return (
    <header className="sticky top-0 z-30 glass border-b border-slate-200/70 h-16 flex items-center px-4 sm:px-6 gap-4">
      <button onClick={onMenu} className="lg:hidden h-10 w-10 grid place-items-center rounded-lg hover:bg-slate-100">
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-white/60 text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-400 focus:bg-white transition"
          />
        </div>
      </div>
      <div className="flex-1 md:hidden" />

      <button className="relative h-10 w-10 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-600 transition">
        <Bell className="h-5 w-5" />
        <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
      </button>

      <div className="relative">
        <button onClick={() => setMenu((v) => !v)} className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 transition">
          <Avatar name={name} size={36} />
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-slate-900 leading-tight">{name}</p>
            <p className="text-xs text-slate-500 leading-tight">{roleLabel}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
        </button>

        {menu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
            <div className="absolute right-0 mt-2 w-56 card p-2 z-20">
              <button onClick={() => { setMenu(false); nav("/profile"); }} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-50">My Profile</button>
              <button onClick={() => { setMenu(false); nav("/settings"); }} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-50">Settings</button>
              <div className="my-1 border-t border-slate-100" />
              <button onClick={() => useAuth().logout()} className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50">Logout</button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export default function AppLayout() {
  const [mobile, setMobile] = useState(false);

  return (
    <div className="min-h-screen day-bg">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 glass border-r border-slate-200/70 z-40 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobile && (
          <>
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobile(false)} />
            <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-50 lg:hidden">
              <button onClick={() => setMobile(false)} className="absolute top-4 right-3 h-9 w-9 grid place-items-center rounded-lg hover:bg-slate-100 lg:hidden">
                <X className="h-5 w-5" />
              </button>
              <SidebarContent onNavigate={() => setMobile(false)} />
            </aside>
          </>
      )}

      <div className="lg:pl-64">
        <Topbar onMenu={() => setMobile(true)} />
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}