export type Severity = "minor" | "major" | "ok";

export type InspectionType = 
  | "Chassis inspection" 
  | "Paint inspection" 
  | "Paint and chassis inspection" 
  | "OBD inspection" 
  | "360 inspection";

export interface SubIssue {
  key: string;
  label: string;
  severity: Severity;
  comment?: string;
  // images: string[];
}

export interface InspectionTab {
  key: string;
  label: string;
  subIssues: SubIssue[];
}

export interface Job {
  _id: string;
  carNumber: string;
  customerName: string;
  engineNumber?: string;
  inspectionType?: InspectionType;
  status: "pending" | "in_progress" | "completed" | "rejected" | "accepted";
  assignedTo?: {
    _id: string;
    email: string;
  } | null;
  rejectionNote?: string;
  inspectionTabs: InspectionTab[];
  createdAt?: string;
  updatedAt?: string;
}
