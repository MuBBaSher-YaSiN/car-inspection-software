import mongoose, { Schema, models } from "mongoose";

const CounterSchema = new Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, required: true, default: 0 },
});

export const Counter = models.Counter || mongoose.model("Counter", CounterSchema);



