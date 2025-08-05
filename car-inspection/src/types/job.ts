// src/types/job.ts

export interface Issue {
  description: string;
  checklist: {
    brakes: boolean;
    lights: boolean;
    tires: boolean;
    engine: boolean;
    other?: string;
  };
  images: string[];
  comments?: string;
}

export interface Job {
  _id: string;
  carNumber: string;
  customerName: string;
  engineNumber?: string;
  status: "pending" | "in_progress" | "completed" | "rejected" | "accepted";
  assignedTo?: {
    _id: string;
    email: string;
  } | null;
  rejectionNote?: string;
  issues: Issue[];
  createdAt?: string;
  updatedAt?: string;
}
