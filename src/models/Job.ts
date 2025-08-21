
import mongoose, { Schema, models } from "mongoose";

const SubIssueSchema = new Schema({
  key: String,
  label: String,
  severity: { type: String, enum: ["minor", "major", "ok"] },
  comment: String,
  // images: [String], 
});

const InspectionTabSchema = new Schema({
  key: String,
  label: String,
  subIssues: [SubIssueSchema],
});

const JobSchema = new Schema(
  {
    carNumber: { type: String, required: true },
    customerName: { type: String, required: true },
    engineNumber: { type: String },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "rejected"],
      default: "pending",
    },
    inspectionTabs: [InspectionTabSchema],
    rejectionNote: String,
  },
  { timestamps: true }
);

export const Job = models.Job || mongoose.model("Job", JobSchema);