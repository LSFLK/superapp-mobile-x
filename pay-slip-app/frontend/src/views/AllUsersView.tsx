import React from "react";
import { User } from "../types";
import { UserCard } from "../components/UserCard";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";

interface AllUsersViewProps {
  users: User[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  onSelectUser?: (user: User) => void;
}

export const AllUsersView: React.FC<AllUsersViewProps> = ({
  users,
  loading,
  error,
  onRetry,
  onSelectUser,
}) => {
  if (loading) {
    return (
      <div className="pb-24">
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="pb-24">
      {error && <ErrorState error={error} onRetry={onRetry} />}

      {!error && users.length === 0 && <EmptyState />}

      {!error && users.length > 0 && (
        <div className="space-y-3">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onClick={() => onSelectUser?.(user)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
