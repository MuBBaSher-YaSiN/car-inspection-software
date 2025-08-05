import { connectToDB } from "@/lib/db";
import { Job } from "@/models/Job";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  context: { params: { [key: string]: string | string[] } }
): Promise<NextResponse> {
  try {
    const { id } = context.params;

    // If id is array, pick first
    const jobId = Array.isArray(id) ? id[0] : id;

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "team") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== "pending" || job.assignedTo) {
      return NextResponse.json(
        { error: "Job is not available to be claimed" },
        { status: 400 }
      );
    }

    job.assignedTo = user._id;
    job.status = "in_progress";
    await job.save();

    return NextResponse.json({ message: "Job claimed successfully" });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}
