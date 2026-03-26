import React from "react";
import { Card } from "./UI.tsx";

export const LoadingState: React.FC = () => {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-5 bg-slate-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-slate-100 rounded w-1/4"></div>
            </div>
            <div className="h-8 w-8 bg-slate-200 rounded"></div>
          </div>
        </Card>
      ))}
    </div>
  );
};
