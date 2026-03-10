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
      // Use /pay-slips endpoint
      // For regular users: returns only their own slips
      // For admins: returns all slips, filtered client-side by userId if provided
      const response = await api.getPayslips(token);

      let filteredSlips = response.data || [];

      // Client-side userId filter for admin views viewing specific user's slips
      if (isAdmin && userId && filteredSlips.length > 0) {
        filteredSlips = filteredSlips.filter((slip) => slip.userId === userId);
      }

      setPayslips(filteredSlips);
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

  return {
    payslips,
    loading,
    error,
    refresh: fetchPayslips,
  };
};
