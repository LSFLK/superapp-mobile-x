import { useState, useEffect, useCallback } from "react";
import { User } from "../types";
import { api } from "../api/client";

interface UseUsersProps {
  token: string | null;
  isAdmin: boolean;
}

export const useUsers = ({ token, isAdmin }: UseUsersProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!token || !isAdmin) return;

    setLoading(true);
    try {
      const result = await api.getUsers(token);
      setUsers(result);
      setError(null);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to load users";
      setError(errorMsg);
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  }, [token, isAdmin]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refresh: fetchUsers };
};
