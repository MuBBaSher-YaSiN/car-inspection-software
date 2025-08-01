import { connectToDB } from "@/lib/db";
import { Job } from "@/models/Job";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "team") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDB();
  const job = await Job.findById(params.id);

  if (!job || job.status !== "pending" || job.assignedTo) {
    return NextResponse.json({ error: "Job cannot be claimed" }, { status: 400 });
  }

  job.assignedTo = session.user._id;
  job.status = "in-progress";
  await job.save();

  return NextResponse.json({ message: "Job claimed successfully" });
}
