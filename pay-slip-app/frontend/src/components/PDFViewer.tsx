import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
// import { Download } from "lucide-react";
//import { Button } from "./UI.tsx";
// import { downloadFile } from "../utils/downloadUtils";

interface PDFViewerProps {
  isOpen: boolean;
  pdfUrl: string;
  fileName?: string;
  onClose: () => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  isOpen,
  pdfUrl,
  fileName = "document.pdf",
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  // const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // simple protocol whitelist validator – only allow http/https URLs
  const isValidUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);

      if (!isValidUrl(pdfUrl)) {
        setLoading(false);
        setError("Invalid PDF URL");
      }
    }
  }, [isOpen, pdfUrl]);

  // const handleDownload = async () => {
  //   try {
  //     setDownloading(true);
  //     await downloadFile(pdfUrl, fileName);
  //   } catch (err) {
  //     console.error("Download failed:", err);
  //     setError("Failed to download PDF");
  //   } finally {
  //     setDownloading(false);
  //   }
  // };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/50 backdrop-blur-sm">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{fileName}</h2>
        <div className="flex items-center gap-2">
          {/* Download button commented out */}
          {/* <Button
            size="sm"
            variant="secondary"
            onClick={handleDownload}
            className="flex items-center gap-2"
            disabled={downloading}
          >
            <Download className="w-4 h-4" />
            {downloading ? "Downloading…" : "Download"}
          </Button> */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto bg-slate-100">
        {loading && (
          <div className="h-full w-full flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center text-slate-600">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
              <p>Loading PDF...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="text-center text-red-600">
            <p className="font-semibold mb-2">Failed to load PDF</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        {!error && isValidUrl(pdfUrl) && (
          <iframe
            src={pdfUrl}
            className="w-full h-full border-none"
            title="PDF Viewer"
            onLoad={() => {
              setLoading(false);
              setError(null);
            }}
            onError={() => {
              setLoading(false);
              setError("Unable to display PDF in viewer");
            }}
          />
        )}
      </div>
    </div>
  );
};
