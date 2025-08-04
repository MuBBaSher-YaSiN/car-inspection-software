// src/app/api/jobs/[id]/claim/route.ts
import { connectToDB } from "@/lib/db";
import { Job } from "@/models/Job";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession({ req, ...authOptions });

    if (!session || session.user.role !== "team") {
      console.error("❌ Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();
    console.log("✅ Connected to DB");

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      console.error("❌ User not found:", session.user.email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("🔍 Looking up job:", params.id);
    const job = await Job.findById(params.id);

    if (!job) {
      console.error("❌ Job not found");
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== "pending") {
      console.error("❌ Job is not in pending status");
      return NextResponse.json(
        { error: "Job is not available to be claimed" },
        { status: 400 }
      );
    }

    if (job.assignedTo) {
      console.error("❌ Job already claimed by:", job.assignedTo);
      return NextResponse.json(
        { error: "Job already claimed by another team member" },
        { status: 400 }
      );
    }

    job.assignedTo = user._id;
    job.status = "in_progress";
    await job.save();

    console.log("✅ Job claimed by user:", user.email);
    return NextResponse.json({ message: "Job claimed successfully" });
  } catch (err: any) {
    console.error("🔥 Error in PATCH /api/jobs/[id]/claim:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
