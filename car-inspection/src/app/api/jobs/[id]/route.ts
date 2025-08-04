import { connectToDB } from "@/lib/db";
import { Job } from "@/models/Job";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();
    const body = await req.json();
    const jobId = params.id;

    const updatePayload: any = {};

    if (body.status === "rejected") {
      updatePayload.status = "in_progress";
      updatePayload.rejectionNote = body.rejectionNote || "";
    } else if (body.status === "completed") {
      updatePayload.status = "completed";
      updatePayload.rejectionNote = "";
    } else {
      return NextResponse.json(
        { error: "Invalid status update" },
        { status: 400 }
      );
    }

    const updatedJob = await Job.findByIdAndUpdate(jobId, updatePayload, {
      new: true,
    });

    if (!updatedJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}
