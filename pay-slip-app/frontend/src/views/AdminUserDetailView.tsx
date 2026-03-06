import React, { useState, useMemo } from "react";
import { PaySlip, PaySlipsFilters, User } from "../types";
import { Filters } from "../components/Filters";
import { PDFViewer } from "../components/PDFViewer";
import { AppPickerModal } from "../components/AppPickerModal";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { Button } from "../components/UI.tsx";
import { Upload, Trash2, FileText } from "lucide-react";
import { useBridge } from "../hooks/useBridge";
import { formatDate } from "../utils/formatters";

interface AdminUserDetailViewProps {
  user: User;
  payslips: PaySlip[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  onUpload?: () => void;
  onDeletePayslip?: (id: string) => void;
}

export const AdminUserDetailView: React.FC<AdminUserDetailViewProps> = ({
  user,
  payslips,
  loading,
  error,
  onRetry,
  onUpload,
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
      {/* User Email and Upload Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{user.email}</p>
        {/* upload should always be available irrespective of role or existing slips */}
        <Button
          onClick={onUpload}
          className="flex items-center gap-2"
          size="sm"
        >
          <Upload className="w-4 h-4" />
          Upload
        </Button>
      </div>

      {/* Filters */}
      <Filters
        month={filters.month}
        onMonthChange={handleMonthChange}
        year={filters.year}
        onYearChange={handleYearChange}
      />

      {/* Payslips */}
      {error && <ErrorState error={error} onRetry={onRetry} />}

      {!error && filteredPayslips.length === 0 && <EmptyState />}

      {!error && filteredPayslips.length > 0 && (
        <div className="space-y-3">
          {filteredPayslips.map((payslip) => (
            <div
              key={payslip.id}
              onClick={() => handleViewClick(payslip)}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-3">
                {/* File Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                </div>

                {/* Content */}
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
                  <p className="text-xs text-slate-500 mt-1">
                    Uploaded: {formatDate(payslip.createdAt)}
                  </p>
                </div>

                {/* Action Buttons */}
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
