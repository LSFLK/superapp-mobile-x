export type Role = "user" | "admin";

export interface User {
  id: string;
  email: string;
  role: Role;
}

export interface PaySlip {
  id: string;
  userId: string;
  userEmail: string;
  month: number;
  year: number;
  fileUrl: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaySlipsResponse {
  data: PaySlip[];
  total: number;
  nextCursor?: string;
}

export interface PaySlipsFilters {
  month: number | "all";
  year: number;
}
