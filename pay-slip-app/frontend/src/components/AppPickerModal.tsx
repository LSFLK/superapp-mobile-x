import React from "react";
import { FileText, ExternalLink } from "lucide-react";
import { Modal } from "./UI.tsx";

interface AppPickerModalProps {
  isOpen: boolean;
  fileName: string;
  onViewInApp: () => void;
  onOpenExternal: () => void;
  // onDownload: () => void; // Commented out - download option removed
  onClose: () => void;
}

export const AppPickerModal: React.FC<AppPickerModalProps> = ({
  isOpen,
  fileName,
  onViewInApp,
  onOpenExternal,
  // onDownload, // Commented out - download option removed
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Open with">
      {/* Subtitle */}
      <p className="text-sm text-slate-600 mb-4">{fileName}</p>

      <div className="space-y-2">
        {/* View in app */}
        <button
          onClick={onViewInApp}
          className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-lg transition-colors text-left"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-900">View in App</p>
            <p className="text-sm text-slate-600">
              Open PDF viewer within the app
            </p>
          </div>
        </button>

        {/* Open with external app */}
        <button
          onClick={onOpenExternal}
          className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-lg transition-colors text-left"
        >
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <ExternalLink className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-900">Open with...</p>
            <p className="text-sm text-slate-600">
              Choose an external PDF viewer app
            </p>
          </div>
        </button>

        {/* Download option commented out - removed for now */}
        {/* 
          <button
            onClick={onDownload}
            className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-lg transition-colors text-left"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Download className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900">Download</p>
              <p className="text-sm text-slate-600">
                Save PDF to device storage
              </p>
            </div>
          </button>
          */}
      </div>
    </Modal>
  );
};
