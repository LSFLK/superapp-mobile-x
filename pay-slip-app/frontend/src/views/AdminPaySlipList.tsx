import React, { useState, useMemo } from "react";
import { PaySlip } from "../types";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { Select } from "../components/UI.tsx";
import { ChevronRight, ChevronDown, FileText, Eye } from "lucide-react";
import { MONTH_NAMES, generateYearRange } from "../constants";
import { formatEmailDisplayName } from "../utils/formatters";
import { PDFViewer } from "../components/PDFViewer";
import { AppPickerModal } from "../components/AppPickerModal";
import { useAuth } from "../hooks/useAuth";
import { useBridge } from "../hooks/useBridge";
import { api } from "../api/client";

interface AdminPaySlipListProps {
  payslips: PaySlip[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
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
  const [selectedPayslip, setSelectedPayslip] = useState<PaySlip | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const { token } = useAuth();
  const { requestDownloadFile } = useBridge();

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

    // Convert to sorted array
    const months: {
      month: number;
      slips: PaySlip[];
      hasData: boolean;
    }[] = [];

    // Add all 12 months
    for (let i = 1; i <= 12; i++) {
      const slipsInMonth = monthMap.get(i) || [];

      months.push({
        month: i,
        slips: slipsInMonth.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
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

  const handleViewClick = (payslip: PaySlip) => {
    setSelectedPayslip(payslip);
    setShowPicker(true);
  };

  const fetchDetails = async (payslip: PaySlip): Promise<PaySlip | null> => {
    if (!token) return null;
    try {
      const detailed = await api.getPayslipById(token, payslip.id);
      return detailed;
    } catch (err) {
      console.error("Failed to fetch details:", err);
      return null;
    }
  };

  const handleViewInApp = async () => {
    setShowPicker(false);
    if (!selectedPayslip) return;
    const detailed = await fetchDetails(selectedPayslip);
    if (detailed) {
      setSelectedPayslip(detailed);
    }
    setShowViewer(true);
  };

  const handleOpenExternal = async () => {
    if (!selectedPayslip) return;

    const detailed = (await fetchDetails(selectedPayslip)) || selectedPayslip;
    try {
      await requestDownloadFile({
        url: detailed.signedUrl || detailed.fileUrl || "",
        filename: `payslip-${detailed.month}-${detailed.year}.pdf`,
      });
    } catch (error) {
      console.error("Failed to open with external app:", error);
    } finally {
      setShowPicker(false);
      setSelectedPayslip(null);
    }
  };

  const handleClosePicker = () => {
    setShowPicker(false);
    setSelectedPayslip(null);
  };

  const handleCloseViewer = () => {
    setShowViewer(false);
    setSelectedPayslip(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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
          {monthsData.map(({ month, slips }) => {
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
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center min-w-[1.75rem] h-7 px-2 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
                      {slips.length}
                    </span>
                  </div>
                </button>

                {isExpanded && slips.length > 0 && (
                  <div className="border-t border-slate-100 p-3 space-y-2">
                    {slips.map((slip) => (
                      <div
                        key={slip.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-900 text-sm truncate">
                              {formatEmailDisplayName(slip.userEmail)}
                            </p>
                            <p className="text-xs text-slate-500">
                              Added {formatDate(slip.createdAt)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewClick(slip)}
                          className="p-2 text-slate-400 hover:text-primary-600 transition-colors flex-shrink-0"
                          title="View pay slip"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* App Picker Modal */}
      {selectedPayslip && (
        <AppPickerModal
          isOpen={showPicker}
          fileName={`payslip-${selectedPayslip.month}-${selectedPayslip.year}.pdf`}
          onViewInApp={handleViewInApp}
          onOpenExternal={handleOpenExternal}
          onClose={handleClosePicker}
        />
      )}

      {/* PDF Viewer */}
      {selectedPayslip && (
        <PDFViewer
          isOpen={showViewer}
          pdfUrl={selectedPayslip.signedUrl || selectedPayslip.fileUrl || ""}
          fileName={`payslip-${selectedPayslip.month}-${selectedPayslip.year}.pdf`}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  );
};
