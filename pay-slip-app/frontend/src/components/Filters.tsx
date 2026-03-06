import React, { useState, useMemo } from "react";
import { Select, Button } from "./UI.tsx";
import { Filter, X } from "lucide-react";
import { MONTH_OPTIONS, generateYearRange } from "../constants";

const mergeClassName = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

interface FiltersProps {
  month: number | "all";
  onMonthChange: (val: number | "all") => void;
  year: number;
  onYearChange: (val: number) => void;
  className?: string;
  /** start with filters panel open? defaults to false */
  defaultExpanded?: boolean;
}

export const Filters: React.FC<FiltersProps> = ({
  month,
  onMonthChange,
  year,
  onYearChange,
  className,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const years = useMemo(() => generateYearRange(), []);

  // badge count has been removed; we just control expansion state
  // (clearAll behavior uses handleClearAll below)

  const handleClearAll = () => {
    onMonthChange("all");
    onYearChange(new Date().getFullYear());
  };

  return (
    <div
      className={mergeClassName(
        "bg-white rounded-xl border border-slate-200 shadow-sm transition-all w-full",
        className,
      )}
    >
      <div className="flex items-center p-2 gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className={mergeClassName(
            "h-9 px-3 flex-shrink-0 flex items-center gap-1.5 w-full justify-center",
            expanded && "bg-primary-50 text-primary-600 border-primary-100",
          )}
        >
          <Filter size={14} />
          <span>Filter Options</span>
        </Button>
      </div>

      {expanded && (
        <div className="bg-slate-50/50 p-3 border-t border-slate-100 grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-200">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
              Year
            </label>
            <Select
              value={year}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                onYearChange(Number(e.target.value))
              }
              className="text-xs h-8"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
              Month
            </label>
            <Select
              value={month}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                onMonthChange(
                  e.target.value === "all" ? "all" : Number(e.target.value),
                )
              }
              className="text-xs h-8"
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="col-span-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="w-full text-xs"
            >
              <X size={14} className="mr-1" />
              Clear All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
