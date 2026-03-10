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
  // the list endpoint may not include any URL; the detailed fetch returns
  // signedUrl (or fileUrl when running against older backend versions).
  fileUrl?: string;
  signedUrl?: string;
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
