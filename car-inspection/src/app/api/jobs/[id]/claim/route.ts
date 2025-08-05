import { connectToDB } from "@/lib/db";
import { Job } from "@/models/Job";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

// @ts-ignore
export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession({ req, ...authOptions });

    if (!session || session.user.role !== "team") {
      console.error("❌ Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
// @ts-ignore
    const job = await Job.findById(params.id);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== "pending" || job.assignedTo) {
      return NextResponse.json({ error: "Job cannot be claimed" }, { status: 400 });
    }

    job.assignedTo = user._id;
    job.status = "in_progress";
    await job.save();

    return NextResponse.json({ message: "Job claimed successfully" });
  } catch (err) {
    console.error("🔥 Error in claim route:", err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}
