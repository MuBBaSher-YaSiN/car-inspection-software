import { z } from "zod";

export const subIssueSchema = z.object({
  key: z.string(),
  label: z.string(),
  severity: z.enum(["safe", "failed", "needs_attention", "other"]),
  comment: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export const inspectionTabSchema = z.object({
  key: z.string(),
  label: z.string(),
  subIssues: z.array(subIssueSchema),
});

export const jobSchema = z.object({
  carNumber: z.string().min(1, "Car number is required"),
  customerName: z.string().min(1, "Customer name is required"),
  engineNumber: z.string().optional(),
  inspectionTabs: z.array(inspectionTabSchema),
  status: z.enum(["pending", "in_progress", "completed", "rejected"]).optional(),
});
