import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface Props {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  hint?: string;
  accent?: "indigo" | "emerald" | "amber" | "sky" | "rose" | "violet";
  index?: number;
}

const accents: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  sky: "bg-sky-50 text-sky-600",
  rose: "bg-rose-50 text-rose-600",
  violet: "bg-violet-50 text-violet-600",
};

export default function StatCard({ label, value, icon, hint, accent = "indigo", index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .35, delay: index * .05, ease: [.16, 1, .3, 1] }}
      whileHover={{ y: -2 }}
      className="card p-5 relative overflow-hidden group"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{value}</p>
          {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
        </div>
        <div className={cn("h-11 w-11 rounded-xl grid place-items-center transition-transform group-hover:scale-110", accents[accent])}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}