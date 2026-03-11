import { useState, useEffect, useCallback } from "react";
import { PaySlip } from "../types";
import { api } from "../api/client";

interface UsePaySlipsProps {
  token: string | null;
  mode: "mine" | "all";
  userId?: string | null;
  autoFetch?: boolean;
}

export const usePaySlips = ({
  token,
  mode,
  userId,
  autoFetch = true,
}: UsePaySlipsProps) => {
  const [payslips, setPayslips] = useState<PaySlip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayslips = useCallback(
    async (overrideUserId?: string) => {
      if (!token) return;

      setLoading(true);
      try {
        const effectiveUserId = overrideUserId ?? userId ?? undefined;
        const response =
          mode === "all"
            ? await api.getAllPayslips(token, { userId: effectiveUserId })
            : await api.getPayslips(token);

        setPayslips(response.data || []);
        setError(null);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to load pay slips";
        setError(errorMsg);
        console.error("Fetch payslips error:", err);
      } finally {
        setLoading(false);
      }
    },
    [token, mode, userId],
  );

  useEffect(() => {
    if (!autoFetch) return;
    fetchPayslips();
  }, [autoFetch, fetchPayslips]);

  return {
    payslips,
    loading,
    error,
    refresh: fetchPayslips,
  };
};
