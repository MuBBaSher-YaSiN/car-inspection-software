// src/types/job.ts
export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'rejected';

export interface Issue {
  description: string;
  checklist: {
    brakes: boolean;
    lights: boolean;
    tires: boolean;
    engine: boolean;
    other?: string;
  };
  images: string[]; // Cloudinary URLs
  comments?: string;
}

export interface JobType {
  _id?: string;
  carNumber: string;
  customerName: string;
  engineNumber?: string;
  assignedTo?: string;
  status: JobStatus;
  issues: Issue[];
  rejectionNote?: string;
  createdAt?: string;
  updatedAt?: string;
}
