import { useState, useEffect, useCallback } from "react";
import { PaySlip } from "../types";
import { api } from "../api/client";

interface UsePaySlipsProps {
  token: string | null;
  isAdmin: boolean;
  userId?: string | null;
}

export const usePaySlips = ({ token, isAdmin, userId }: UsePaySlipsProps) => {
  const [payslips, setPayslips] = useState<PaySlip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayslips = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await api.getPayslips(token);
      const allPayslips = response.data || [];

      // If fetching a specific user's payslips (admin detail view),
      // filter the results client-side
      if (userId && isAdmin) {
        setPayslips(allPayslips.filter((slip) => slip.userId === userId));
      } else {
        setPayslips(allPayslips);
      }

      setError(null);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to load pay slips";
      setError(errorMsg);
      console.error("Fetch payslips error:", err);
    } finally {
      setLoading(false);
    }
  }, [token, isAdmin, userId]);

  useEffect(() => {
    fetchPayslips();
  }, [fetchPayslips]);

  return { payslips, loading, error, refresh: fetchPayslips };
};
