import React, { useState, useMemo } from "react";
import { PaySlip, PaySlipsFilters } from "../types";
import { Filters } from "../components/Filters";
import { PaySlipCard } from "../components/PaySlipCard";
import { PDFViewer } from "../components/PDFViewer";
import { AppPickerModal } from "../components/AppPickerModal";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { useBridge } from "../hooks/useBridge";

interface PaySlipListProps {
  payslips: PaySlip[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export const PaySlipList: React.FC<PaySlipListProps> = ({
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
      />

      {error && <ErrorState error={error} onRetry={onRetry} />}

      {!error && filteredPayslips.length === 0 && <EmptyState />}

      {!error && filteredPayslips.length > 0 && (
        <div className="space-y-3">
          {filteredPayslips.map((payslip) => (
            <PaySlipCard
              key={payslip.id}
              payslip={payslip}
              onView={() => handleViewClick(payslip)}
            />
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
