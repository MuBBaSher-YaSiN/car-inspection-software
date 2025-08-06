/* eslint-disable */
/* @ts-nocheck */

import { connectToDB } from "@/lib/db";
import { Job } from "@/models/Job";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession({ req, ...authOptions });

    if (!session || session.user.role !== "team") {
      console.error("❌ Unauthorized access");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();
    console.log("✅ DB connected for complete");
    // @ts-ignore
    const job = await Job.findById(params.id);

    if (!job) {
      console.error("❌ Job not found");
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (
      job.assignedTo.toString() !== session.user._id ||
      job.status !== "in_progress"
    ) {
      console.error("❌ Unauthorized or invalid job status");
      return NextResponse.json(
        { error: "You can't mark this job complete" },
        { status: 400 }
      );
    }

    job.status = "completed";
    await job.save();

    console.log("✅ Job marked completed by:", session.user.email);
    return NextResponse.json({ message: "Job marked as completed" });
  } catch (err) {
    console.error("🔥 Error in complete route:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
