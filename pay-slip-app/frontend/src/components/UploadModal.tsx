import React, { useState, useMemo } from "react";
import { Upload as UploadIcon, File } from "lucide-react";
import { Button, Modal } from "./UI.tsx";
import { User, PaySlip } from "../types";
import { UPLOAD_CONFIG, DATE_CONFIG, generateYearRange } from "../constants";
import { formatEmailDisplayName } from "../utils/formatters";

interface UploadModalProps {
  isOpen: boolean;
  users: User[];
  payslips: PaySlip[];
  preselectedUserId?: string;
  onClose: () => void;
  onUpload: (data: {
    userId: string;
    month: number;
    year: number;
    file: File;
  }) => Promise<void>;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  users,
  payslips,
  preselectedUserId,
  onClose,
  onUpload,
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [userId, setUserId] = useState(preselectedUserId || "");
  const [month, setMonth] = useState<number>(0);
  const [year, setYear] = useState<number>(currentYear);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setUserId(preselectedUserId || "");
      setMonth(0);
      setYear(currentYear);
      setFile(null);
      setError(null);
      setUploading(false);
    }
  }, [isOpen, preselectedUserId, currentMonth, currentYear]);

  // Check if a payslip already exists for the selected user/month/year
  const existingPayslip = useMemo(() => {
    if (!userId || !month || !year) return null;
    return payslips.find(
      (ps) => ps.userId === userId && ps.month === month && ps.year === year,
    );
  }, [payslips, userId, month, year]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (selectedFile.type !== UPLOAD_CONFIG.ACCEPTED_FILE_TYPE) {
        setError("Please select a PDF file");
        setFile(null);
        return;
      }
      // Validate file size
      if (selectedFile.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
        setError(
          `File size must be less than ${UPLOAD_CONFIG.MAX_FILE_SIZE_MB}MB`,
        );
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !file || !month) {
      setError("Please fill all required fields");
      return;
    }

    if (existingPayslip) {
      setError(
        "A pay slip already exists for this month. Please delete it first before uploading a new one.",
      );
      return;
    }

    try {
      setUploading(true);
      setError(null);
      await onUpload({ userId, month, year, file });
      onClose();
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Pay Slip">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Employee <span className="text-red-500">*</span>
          </label>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
            required
            disabled={uploading || !!preselectedUserId}
          >
            <option value="">Select employee</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {formatEmailDisplayName(user.email)}
              </option>
            ))}
          </select>
        </div>

        {/* Month Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Month <span className="text-red-500">*</span>
          </label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            required
            disabled={uploading}
          >
            <option value={0} disabled hidden>
              Select month
            </option>
            {Array.from(
              { length: DATE_CONFIG.MONTHS_IN_YEAR },
              (_, i) => i + 1,
            ).map((m) => (
              <option key={m} value={m}>
                {new Date(2000, m - 1).toLocaleString("en-US", {
                  month: "long",
                })}
              </option>
            ))}
          </select>
        </div>

        {/* Year Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Year <span className="text-red-500">*</span>
          </label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            required
            disabled={uploading}
          >
            {generateYearRange().map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            PDF File <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              disabled={uploading}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              {file ? (
                <>
                  <File className="w-12 h-12 text-blue-600 mb-2" />
                  <p className="text-sm font-medium text-slate-900">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <UploadIcon className="w-12 h-12 text-slate-400 mb-2" />
                  <p className="text-sm font-medium text-slate-900">
                    Click to upload PDF
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Max 10MB</p>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Existing Payslip Info */}
        {existingPayslip && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              This month pay slip already exists.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={uploading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              uploading || !file || !userId || !month || !!existingPayslip
            }
            className="flex-1"
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
