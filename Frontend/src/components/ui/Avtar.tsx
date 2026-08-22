import React from "react";
import { cn, initials } from "@/utils/cn";

const gradients = [
  "from-indigo-500 to-violet-500",
  "from-sky-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-fuchsia-500 to-purple-500",
];

export default function Avatar({ name, size = 40, className }: { name: string; size?: number; className?: string }) {
  const idx = name.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % gradients.length;
  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br text-white flex items-center justify-center font-semibold shrink-0 select-none ring-2 ring-white",
        gradients[idx], className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </div>
  );
}