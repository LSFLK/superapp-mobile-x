import React from "react";
import { Card } from "./UI.tsx";
// import { Download, FileText, Eye } from "lucide-react";
import { FileText, Eye } from "lucide-react";
import { PaySlip } from "../types";
import { formatMonthYear, formatDate } from "../utils/formatters";
// import { downloadFile } from "../utils/downloadUtils";
// import { useBridge } from "../hooks/useBridge";

interface PaySlipCardProps {
  payslip: PaySlip;
  onView?: () => void;
}

export const PaySlipCard: React.FC<PaySlipCardProps> = ({
  payslip,
  onView,
}) => {
  // const { requestDownloadFile } = useBridge();

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView?.();
  };

  // Download button temporarily disabled
  // const handleDownload = async (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   const filename = `payslip-${payslip.month}-${payslip.year}.pdf`;

  //   try {
  //     // Use native bridge if available (bypasses CORS issues)
  //     if (typeof requestDownloadFile === "function") {
  //       await requestDownloadFile({
  //         url: payslip.fileUrl,
  //         filename,
  //       });
  //       return;
  //     }

  //     // Fallback to web download
  //     await downloadFile(payslip.fileUrl, filename);
  //   } catch (error) {
  //     console.error("Download failed:", error);
  //     alert("Download failed. Please try again or contact support.");
  //   }
  // };

  return (
    <Card className="transition-all hover:shadow-md group relative">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-1">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 group-hover:text-primary-600 transition-colors">
              {formatMonthYear(payslip.month, payslip.year)}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Uploaded: {formatDate(payslip.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleView}
            className="p-2 text-slate-400 hover:text-primary-600 transition-colors"
            title="View pay slip"
          >
            <Eye className="w-5 h-5" />
          </button>
          {/* Download button temporarily disabled */}
          {/* <button
            onClick={handleDownload}
            className="p-2 text-slate-400 hover:text-primary-600 transition-colors"
            title="Download pay slip"
          >
            <Download className="w-5 h-5" />
          </button> */}
        </div>
      </div>
    </Card>
  );
};
