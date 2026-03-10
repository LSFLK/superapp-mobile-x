import React, { useState, useMemo } from "react";
import { PaySlip, PaySlipsFilters } from "../types";
import { PDFViewer } from "../components/PDFViewer";
import { AppPickerModal } from "../components/AppPickerModal";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { Select } from "../components/UI.tsx";
import { Trash2, FileText } from "lucide-react";
import { useBridge } from "../hooks/useBridge";
import { formatDate } from "../utils/formatters";
import { generateYearRange, MONTH_OPTIONS } from "../constants";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/client";

interface AdminUserDetailViewProps {
  payslips: PaySlip[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  onDeletePayslip?: (id: string) => void;
}

export const AdminUserDetailView: React.FC<AdminUserDetailViewProps> = ({
  payslips,
  loading,
  error,
  onRetry,
  onDeletePayslip,
}) => {
  const [filters, setFilters] = useState<PaySlipsFilters>({
    month: "all" as const,
    year: new Date().getFullYear(),
  });

  const [selectedPayslip, setSelectedPayslip] = useState<PaySlip | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const { requestDownloadFile } = useBridge();
  const years = useMemo(() => generateYearRange(), []);

  const sortedPayslips = useMemo(() => {
    return payslips.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      return b.month - a.month;
    });
  }, [payslips]);

  const handleMonthChange = (month: number | "all") => {
    setFilters((prev) => ({ ...prev, month }));
  };

  const handleYearChange = (year: number) => {
    setFilters((prev) => ({ ...prev, year }));
  };

  const { token } = useAuth();

  const handleViewClick = (payslip: PaySlip) => {
    setSelectedPayslip(payslip);
    setShowPicker(true);
  };

  const fetchDetails = async (): Promise<PaySlip | null> => {
    if (!token || !selectedPayslip) return null;
    try {
      return await api.getPayslipById(token, selectedPayslip.id);
    } catch (err) {
      console.error("Failed to fetch payslip details:", err);
      return selectedPayslip;
    }
  };

  const handleViewInApp = async () => {
    setShowPicker(false);
    const detailed = await fetchDetails();
    if (detailed) setSelectedPayslip(detailed);
    setShowViewer(true);
  };

  const handleOpenExternal = async () => {
    if (!selectedPayslip) return;

    const detailed = (await fetchDetails()) || selectedPayslip;
    try {
      // Use the native bridge to open with external app
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

  if (loading) {
    return (
      <div className="space-y-4 pb-24">
        <div className="grid grid-cols-2 gap-3">
          <Select value={filters.year} onChange={() => undefined}>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
          <Select value={filters.month} onChange={() => undefined}>
            {MONTH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>
        </div>
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <div className="grid grid-cols-2 gap-3">
        <Select
          value={filters.year}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            handleYearChange(Number(e.target.value))
          }
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </Select>
        <Select
          value={filters.month}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            handleMonthChange(
              e.target.value === "all" ? "all" : Number(e.target.value),
            )
          }
        >
          {MONTH_OPTIONS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </Select>
      </div>

      {error && <ErrorState error={error} onRetry={onRetry} />}

      {!error && sortedPayslips.length === 0 && <EmptyState />}

      {!error && sortedPayslips.length > 0 && (
        <div className="space-y-3">
          {sortedPayslips.map((payslip) => (
            <div
              key={payslip.id}
              onClick={() => handleViewClick(payslip)}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900">
                    {new Date(
                      payslip.year,
                      payslip.month - 1,
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2">
                    Date: {formatDate(payslip.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePayslip?.(payslip.id);
                    }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete pay slip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPayslip && (
        <AppPickerModal
          isOpen={showPicker}
          fileName={`payslip-${selectedPayslip.month}-${selectedPayslip.year}.pdf`}
          onViewInApp={handleViewInApp}
          onOpenExternal={handleOpenExternal}
          onClose={handleClosePicker}
        />
      )}

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
