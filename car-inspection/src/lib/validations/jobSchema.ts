// src/lib/validations/jobSchema.ts
import { z } from "zod";

export const issueSchema = z.object({
  description: z.string().min(1, "Issue description is required"),
  checklist: z.object({
    brakes: z.boolean().optional(),
    lights: z.boolean().optional(),
    tires: z.boolean().optional(),
    engine: z.boolean().optional(),
    other: z.string().optional(),
  }),
  images: z.array(z.string()).optional(),
  comments: z.string().optional(),
});

export const jobSchema = z.object({
  carNumber: z.string().min(1, "Car number is required"),
  customerName: z.string().min(1, "Customer name is required"),
  engineNumber: z.string().optional(),
  issues: z.array(issueSchema),
});
