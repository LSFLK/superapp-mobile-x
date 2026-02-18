import React, { useState, useEffect } from "react";
import { Card, Button, Input, Select } from "../components/UI";
import { LeaveType } from "../types";
import { AlertCircle, Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useLeaves } from "../hooks/useLeaves";

interface AddLeaveProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  balances: any;
  holidays: string[];
}

export const AddLeave: React.FC<AddLeaveProps> = ({
  onSubmit,
  onCancel,
  balances,
  holidays,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: "sick" as LeaveType,
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [duration, setDuration] = useState(0);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      if (start <= end) {
        let count = 0;
        const current = new Date(start);

        while (current <= end) {
          const day = current.getDay();
          const formatted = formatDate(current);

          if (day !== 0 && day !== 6 && !holidays.includes(formatted)) {
            count++;
          }

          current.setDate(current.getDate() + 1);
        }

        setDuration(count);
      } else {
        setDuration(0);
      }
    }
  }, [formData.startDate, formData.endDate, holidays]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.startDate || !formData.endDate || !formData.reason) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
      onCancel();
    } catch (e: any) {
      setError(e.message || "Failed to submit request");
    } finally {
      setIsLoading(false);
    }
  };

  const isHoliday = (date: Date) => {
    const formatted = formatDate(date);
    return holidays.includes(formatted);
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const isSelectedRange = (date: Date) => {
    if (!formData.startDate || !formData.endDate) return false;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    // Normalize all dates to midnight
    const normalize = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const normalizedDate = normalize(date);
    const normalizedStart = normalize(start);
    const normalizedEnd = normalize(end);

    const isInRange =
      normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;

    // Exclude weekends
    const day = normalizedDate.getDay();
    const isWeekendDay = day === 0 || day === 6;

    // Exclude holidays
    const formatted = formatDate(normalizedDate);
    const isHolidayDay = holidays.includes(formatted);

    return isInRange && !isWeekendDay && !isHolidayDay;
  };

  const remaining = balances ? balances[formData.type] : 0;
  const isOverLimit = duration > remaining;

  return (
    <div className="pb-24 animate-in slide-in-from-bottom-4 duration-300">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-800">Request Time Off</h2>
        <p className="text-sm text-slate-500">Fill out the details below.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-start">
              <AlertCircle size={16} className="mr-2 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
              Leave Type
            </label>
            <Select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as LeaveType })
              }
            >
              <option value="sick">Sick Leave</option>
              <option value="annual">Annual Leave</option>
              <option value="casual">Casual Leave</option>
            </Select>
            <div className="mt-2 text-xs text-right">
              <span className="text-slate-500">Balance: </span>
              <span
                className={`font-bold ${remaining === 0 ? "text-red-500" : "text-emerald-600"}`}
              >
                {remaining} days available
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                From
              </label>
              <div className="relative">
                <Input
                  type="date"
                  required
                  value={formData.startDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                To
              </label>
              <div className="relative">
                <Input
                  type="date"
                  required
                  value={formData.endDate}
                  min={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <DayPicker
            defaultMonth={
              formData.startDate ? new Date(formData.startDate) : new Date()
            }
            showOutsideDays
            disabled={[{ before: new Date() }, isWeekend, isHoliday]}
            modifiers={{
              selectedRange: isSelectedRange,
              holiday: isHoliday,
            }}
            modifiersStyles={{
              selectedRange: {
                backgroundColor: "rgba(37, 99, 235, 0.3)",
                color: "#1e3a8a",
              },
              holiday: {
                backgroundColor: "rgba(239, 68, 68, 0.4)",
                color: "#991b1b",
              },
            }}
          />
          {/* Calendar Legend */}
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-blue-600/60"></span>
              <span>Days you will be on leave</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-red-500/70"></span>
              <span>Public holidays</span>
            </div>
          </div>

          {duration > 0 && (
            <div
              className={`p-3 rounded-xl text-sm border ${
                isOverLimit
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-blue-50 border-blue-200 text-blue-700"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <CalendarIcon size={16} className="mr-2" />
                  Leave will apply for:
                </span>
                <span className="font-bold">{duration} Days</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
              Reason
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 min-h-[100px] resize-none"
              placeholder="Describe why you need time off..."
              required
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
            />
          </div>

          <div className="pt-2 flex gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              isLoading={isLoading}
              disabled={isOverLimit || duration <= 0}
            >
              Submit Request
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
