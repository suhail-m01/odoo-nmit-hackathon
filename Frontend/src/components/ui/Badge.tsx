import React from "react";
import { cn } from "@/utils/cn";

type Tone = "gray" | "green" | "red" | "amber" | "blue" | "violet";

const tones: Record<Tone, string> = {
  gray: "bg-slate-100 text-slate-700",
  green: "bg-emerald-100 text-emerald-700",
  red: "bg-red-100 text-red-700",
  amber: "bg-amber-100 text-amber-700",
  blue: "bg-sky-100 text-sky-700",
  violet: "bg-violet-100 text-violet-700",
};

export default function Badge({ tone = "gray", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return <span className={cn("badge", tones[tone], className)}>{children}</span>;
}