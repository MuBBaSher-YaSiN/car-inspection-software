import mongoose from "mongoose";

const issueSchema = new mongoose.Schema({
  description: String,
  checklist: {
    brakes: Boolean,
    lights: Boolean,
    tires: Boolean,
    engine: Boolean,
    other: String,
  },
  images: [String],
  comments: String,
});

const jobSchema = new mongoose.Schema(
  {
    carNumber: { type: String, required: true },
    customerName: { type: String, required: true },
    engineNumber: { type: String },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "rejected"],
      default: "pending",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejectionNote: {
      type: String,
      default: "",
    },
    issues: [issueSchema],
  },
  { timestamps: true }
);

export const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);
