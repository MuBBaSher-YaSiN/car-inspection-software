// src/models/Job.ts
import mongoose, { Schema, models } from 'mongoose';

const IssueSchema = new Schema({
  description: { type: String, required: true },
  checklist: {
    brakes: Boolean,
    lights: Boolean,
    tires: Boolean,
    engine: Boolean,
    other: String,
  },
  images: [String], // Cloudinary URLs
  comments: String,
});

const JobSchema = new Schema(
  {
    carNumber: { type: String, required: true },
    customerName: { type: String, required: true },
    engineNumber: { type: String },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'rejected'],
      default: 'pending',
    },
    issues: [IssueSchema],
    rejectionNote: String,
  },
  { timestamps: true }
);

export const Job = models.Job || mongoose.model('Job', JobSchema);
