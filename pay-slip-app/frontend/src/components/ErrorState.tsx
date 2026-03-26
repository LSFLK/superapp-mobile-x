import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./UI.tsx";

export const ErrorState: React.FC<{
  error: string;
  onRetry?: () => void;
}> = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-center px-4 bg-red-50/50 rounded-xl border border-dashed border-red-200 mt-4">
      <AlertTriangle className="w-10 h-10 mb-3 text-red-400" />
      <p className="text-sm text-red-600 mb-3">{error}</p>
      {onRetry && (
        <Button variant="primary" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
};
