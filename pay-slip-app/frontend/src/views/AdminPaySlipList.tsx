import React, { useState, useMemo } from "react";
import { PaySlip } from "../types";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { Select } from "../components/UI.tsx";
import { ChevronRight, ChevronDown } from "lucide-react";
import { MONTH_NAMES, generateYearRange } from "../constants";
import { formatEmailDisplayName } from "../utils/formatters";

interface AdminPaySlipListProps {
  payslips: PaySlip[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

interface UserInMonth {
  email: string;
  userId: string;
  payslipCount: number;
}

export const AdminPaySlipList: React.FC<AdminPaySlipListProps> = ({
  payslips,
  loading,
  error,
  onRetry,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set());

  const availableYears = useMemo(() => {
    const years = new Set(payslips.map((p) => p.year));
    const allYears = generateYearRange();
    return allYears.filter((y) => years.has(y) || y === selectedYear);
  }, [payslips, selectedYear]);

  // Group payslips by month for the selected year
  const monthsData = useMemo(() => {
    const yearPayslips = payslips.filter((p) => p.year === selectedYear);

    // Group by month
    const monthMap = new Map<number, PaySlip[]>();
    yearPayslips.forEach((p) => {
      if (!monthMap.has(p.month)) {
        monthMap.set(p.month, []);
      }
      monthMap.get(p.month)!.push(p);
    });

    // Convert to sorted array with user data
    const months: {
      month: number;
      users: UserInMonth[];
      hasData: boolean;
    }[] = [];

    // Add all 12 months
    for (let i = 1; i <= 12; i++) {
      const slipsInMonth = monthMap.get(i) || [];
      const userMap = new Map<string, UserInMonth>();

      slipsInMonth.forEach((slip) => {
        if (!userMap.has(slip.userEmail)) {
          userMap.set(slip.userEmail, {
            email: slip.userEmail,
            userId: slip.userId,
            payslipCount: 0,
          });
        }
        userMap.get(slip.userEmail)!.payslipCount += 1;
      });

      months.push({
        month: i,
        users: Array.from(userMap.values()).sort((a, b) =>
          a.email.localeCompare(b.email),
        ),
        hasData: slipsInMonth.length > 0,
      });
    }

    // Only return months with data, sorted descending
    return months.filter((m) => m.hasData).sort((a, b) => b.month - a.month);
  }, [payslips, selectedYear]);

  const toggleMonth = (month: number) => {
    setExpandedMonths((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(month)) {
        newSet.delete(month);
      } else {
        newSet.add(month);
      }
      return newSet;
    });
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Year Selector */}
      <Select
        value={selectedYear}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
          setSelectedYear(Number(e.target.value));
          setExpandedMonths(new Set());
        }}
        className="bg-white border-slate-200 shadow-sm"
      >
        {availableYears.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </Select>

      {error && <ErrorState error={error} onRetry={onRetry} />}

      {!error && monthsData.length === 0 && (
        <EmptyState message={`No pay slips found for ${selectedYear}`} />
      )}

      {!error && monthsData.length > 0 && (
        <div className="space-y-3">
          {monthsData.map(({ month, users }) => {
            const isExpanded = expandedMonths.has(month);
            return (
              <div
                key={month}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleMonth(month)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                    <span className="font-medium text-slate-900">
                      {MONTH_NAMES[month - 1]} {selectedYear}
                    </span>
                  </div>
                </button>

                {isExpanded && users.length > 0 && (
                  <div className="border-t border-slate-100 p-3 space-y-2">
                    {users.map((user) => (
                      <div
                        key={user.userId}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-sm">
                            {user.email
                              .split("@")[0]
                              .split(".")
                              .map((p) => p.charAt(0).toUpperCase())
                              .join("")}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">
                              {formatEmailDisplayName(user.email)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
