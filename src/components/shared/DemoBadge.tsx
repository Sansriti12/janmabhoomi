import React from "react";

interface DemoBadgeProps {
  label?: string;
  variant?: "subtle" | "gold" | "outline";
}

export function DemoBadge({
  label = "SAMPLE / DEMO DATA",
  variant = "subtle",
}: DemoBadgeProps) {
  const styles = {
    subtle:
      "bg-[#FAF8F3] text-[#292725]/70 border border-[#292725]/15",
    gold:
      "bg-[#C59B4B]/15 text-[#7A5B1E] border border-[#C59B4B]/40",
    outline:
      "bg-white/90 text-[#174F73] border border-[#174F73]/25",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[variant]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[#C59B4B]" />
      {label}
    </span>
  );
}
