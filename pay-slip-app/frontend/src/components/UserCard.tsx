import React from "react";
import { Card } from "./UI.tsx";
import { ChevronRight } from "lucide-react";
import { User } from "../types";
import { className } from "../utils/className";
import { formatEmailDisplayName } from "../utils/formatters";

interface UserCardProps {
  user: User;
  onClick?: () => void;
}

const getInitials = (email: string): string => {
  const parts = email.split("@")[0].split(".");
  return parts.map((p) => p.charAt(0).toUpperCase()).join("");
};

const getAvatarColor = (email: string): string => {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-pink-100 text-pink-700",
    "bg-green-100 text-green-700",
    "bg-amber-100 text-amber-700",
    "bg-cyan-100 text-cyan-700",
  ];
  const index = email.charCodeAt(0) % colors.length;
  return colors[index];
};

export const UserCard: React.FC<UserCardProps> = ({ user, onClick }) => {
  const initials = getInitials(user.email);
  const avatarColor = getAvatarColor(user.email);

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer transition-all hover:shadow-md group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={className(
              "w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm flex-shrink-0",
              avatarColor,
            )}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors truncate">
              {formatEmailDisplayName(user.email)}
            </h3>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 transition-colors flex-shrink-0 ml-2" />
      </div>
    </Card>
  );
};
