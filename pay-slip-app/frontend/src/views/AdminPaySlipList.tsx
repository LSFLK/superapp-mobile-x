import React, { useState, useMemo } from "react";
import { PaySlip, PaySlipsFilters } from "../types";
import { Filters } from "../components/Filters";
import { PDFViewer } from "../components/PDFViewer";
import { AppPickerModal } from "../components/AppPickerModal";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { Card } from "../components/UI.tsx";
import { FileText, ChevronDown } from "lucide-react";
import { useBridge } from "../hooks/useBridge";
import { MONTH_NAMES } from "../constants";
import { formatEmailDisplayName } from "../utils/formatters";

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
  const [filters, setFilters] = useState<PaySlipsFilters>({
    month: "all",
    year: new Date().getFullYear(),
  });

  const [selectedPayslip, setSelectedPayslip] = useState<PaySlip | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const { requestDownloadFile } = useBridge();

  const filteredPayslips = useMemo(() => {
    return payslips
      .filter((ps) => {
        if (filters.month !== "all" && ps.month !== filters.month) return false;
        if (ps.year !== filters.year) return false;
        return true;
      })
      .sort((a, b) => {
        // Sort by year descending, then by month descending
        if (a.year !== b.year) {
          return b.year - a.year;
        }
        return b.month - a.month;
      });
  }, [payslips, filters]);

  const handleMonthChange = (month: number | "all") => {
    setFilters((prev) => ({ ...prev, month }));
  };

  const handleYearChange = (year: number) => {
    setFilters((prev) => ({ ...prev, year }));
  };

  const handleViewClick = (payslip: PaySlip) => {
    setSelectedPayslip(payslip);
    setShowPicker(true);
  };

  const handleViewInApp = () => {
    setShowPicker(false);
    setShowViewer(true);
  };

  const handleOpenExternal = async () => {
    if (!selectedPayslip) return;

    try {
      // Use the native bridge to open with external app
      await requestDownloadFile({
        url: selectedPayslip.fileUrl,
        filename: `payslip-${selectedPayslip.month}-${selectedPayslip.year}.pdf`,
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

  // aggregate stats based on filtered list
  const totalCount = filteredPayslips.length;
  const userCount = useMemo(() => {
    const set = new Set(filteredPayslips.map((p) => p.userEmail));
    return set.size;
  }, [filteredPayslips]);

  const grouped = useMemo(() => {
    const map: Record<string, PaySlip[]> = {};
    filteredPayslips.forEach((p) => {
      if (!map[p.userEmail]) map[p.userEmail] = [];
      map[p.userEmail].push(p);
    });
    // Sort slips within each user group (latest first)
    Object.keys(map).forEach((email) => {
      map[email].sort((a, b) => {
        if (a.year !== b.year) {
          return b.year - a.year;
        }
        return b.month - a.month;
      });
    });
    return map;
  }, [filteredPayslips]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const init: Record<string, boolean> = {};
    Object.keys(grouped).forEach((email) => {
      init[email] = true; // expand by default
    });
    setOpenGroups(init);
  }, [grouped]);

  if (loading) {
    return (
      <div className="space-y-4 pb-24">
        <Filters
          month={filters.month}
          onMonthChange={handleMonthChange}
          year={filters.year}
          onYearChange={handleYearChange}
        />
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <Filters
        month={filters.month}
        onMonthChange={handleMonthChange}
        year={filters.year}
        onYearChange={handleYearChange}
        defaultExpanded={true}
      />

      {/* summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 text-center">
          <p className="text-sm text-slate-500">TOTAL PAY SLIPS</p>
          <p className="text-2xl font-bold text-slate-900">{totalCount}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-slate-500">USERS</p>
          <p className="text-2xl font-bold text-primary-600">{userCount}</p>
        </Card>
      </div>

      {error && <ErrorState error={error} onRetry={onRetry} />}

      {!error && totalCount === 0 && <EmptyState />}

      {!error && totalCount > 0 && (
        <div className="space-y-4">
          {Object.entries(grouped).map(([email, slips]) => (
            <div key={email} className="bg-white rounded-2xl shadow-sm p-4">
              <h3
                className="font-semibold text-slate-900 mb-3 flex items-center justify-between cursor-pointer"
                onClick={() =>
                  setOpenGroups((prev) => ({
                    ...prev,
                    [email]: !prev[email],
                  }))
                }
              >
                <span>{formatEmailDisplayName(email)}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-150 ${
                    openGroups[email] ? "rotate-180" : ""
                  }`}
                />
              </h3>
              {openGroups[email] && (
                <div className="space-y-2">
                  {slips.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleViewClick(p)}
                      className="flex items-center justify-between py-2 cursor-pointer hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary-600" />
                        <span className="text-slate-900 font-medium">
                          {MONTH_NAMES[p.month - 1]} {p.year}
                        </span>
                      </div>
                      <span className="text-sm text-slate-400">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
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
          pdfUrl={selectedPayslip.fileUrl}
          fileName={`payslip-${selectedPayslip.month}-${selectedPayslip.year}.pdf`}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  );
};
