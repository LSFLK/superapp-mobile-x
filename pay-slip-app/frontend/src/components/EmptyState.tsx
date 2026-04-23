import React from "react";
import { FileText } from "lucide-react";

export const EmptyState: React.FC<{ message?: string }> = ({
  message = "No pay slips found",
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 mt-4">
      <FileText className="w-10 h-10 mb-3 opacity-20" />
      <p className="text-sm">{message}</p>
    </div>
  );
};
