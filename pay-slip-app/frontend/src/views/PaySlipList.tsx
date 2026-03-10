import React, { useState, useMemo } from "react";
import { PaySlip, PaySlipsFilters } from "../types";
import { PaySlipCard } from "../components/PaySlipCard";
import { PDFViewer } from "../components/PDFViewer";
import { AppPickerModal } from "../components/AppPickerModal";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { Select } from "../components/UI.tsx";
import { useBridge } from "../hooks/useBridge";
import { MONTH_OPTIONS, generateYearRange } from "../constants";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/client";

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

  const { token } = useAuth();

  const handleViewClick = (payslip: PaySlip) => {
    setSelectedPayslip(payslip);
    setShowPicker(true);
  };

  const fetchDetails = async (): Promise<PaySlip | null> => {
    if (!token || !selectedPayslip) return null;
    try {
      const detailed = await api.getPayslipById(token, selectedPayslip.id);
      return detailed;
    } catch (err) {
      console.error("Failed to fetch payslip details:", err);
      return selectedPayslip;
    }
  };

  const handleViewInApp = async () => {
    setShowPicker(false);
    const detailed = await fetchDetails();
    if (detailed) {
      setSelectedPayslip(detailed);
    }
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

  const years = useMemo(() => generateYearRange(), []);

  if (loading) {
    return (
      <div className="space-y-4 pb-24">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Select
              value={filters.year}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleYearChange(Number(e.target.value))
              }
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </div>
          <div>
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
        </div>
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Select
            value={filters.year}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              handleYearChange(Number(e.target.value))
            }
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </div>
        <div>
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
      </div>

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
          pdfUrl={selectedPayslip.signedUrl || selectedPayslip.fileUrl || ""}
          fileName={`payslip-${selectedPayslip.month}-${selectedPayslip.year}.pdf`}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  );
};
