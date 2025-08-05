import { NextRequest, NextResponse, type RouteHandlerContext } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDB } from "@/lib/db";
import { Job } from "@/models/Job";
import { User } from "@/models/User";

export async function PATCH(
  req: NextRequest,
  context: RouteHandlerContext
): Promise<NextResponse> {
  const session = await getServerSession(req, authOptions);
  if (!session || session.user.role !== "team") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobId = context.params.id as string;

  await connectToDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const job = await Job.findById(jobId);
  if (!job || job.status !== "pending" || job.assignedTo) {
    return NextResponse.json({ error: "Invalid job state" }, { status: 400 });
  }

  job.assignedTo = user._id;
  job.status = "in_progress";
  await job.save();

  return NextResponse.json({ message: "Job claimed successfully" });
}
