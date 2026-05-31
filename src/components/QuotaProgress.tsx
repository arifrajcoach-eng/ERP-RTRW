import React from "react";
import { motion } from "motion/react";

export const QuotaProgress = ({
  label,
  current,
  max,
  color = "blue",
  isText = false,
}: {
  label: string;
  current: any;
  max: any;
  color?: string;
  isText?: boolean;
}) => {
  const percentage = isText ? 100 : Math.min(100, (current / max) * 100);
  const colorMap: Record<string, string> = {
    blue: "bg-brand-blue",
    pink: "bg-brand-pink",
    yellow: "bg-brand-yellow",
    indigo: "bg-indigo-600",
    emerald: "bg-emerald-600",
  };

  return (
    <div className="space-y-1.5 flex-1">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
          {label}
        </span>
        <span
          className={`text-[10px] font-black ${isText ? "text-indigo-600" : "text-slate-600"}`}
        >
          {isText ? (
            current
          ) : (
            <>
              {current} / <span className="text-slate-400">{max}</span>
            </>
          )}
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full ${colorMap[color] || "bg-brand-blue"}`}
        />
      </div>
    </div>
  );
};
