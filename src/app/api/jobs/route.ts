import { connectToDB } from "@/lib/db";
import { Job } from "@/models/Job";
import { jobSchema } from "@/lib/validations/jobSchema";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { User } from "@/models/User"; 
export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();
    const parsed = jobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    //@ts-ignore
    const newJob = await Job.create(parsed.data);
    return NextResponse.json(newJob, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Job creation failed", details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession({ req, ...authOptions });

    if (!session) {
      console.log(" No session found in /api/jobs");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const role = session.user.role;
    const email = session.user.email;

    let jobs;

    if (role === "admin") {
      // @ts-ignore
      jobs = await Job.find({}).populate("assignedTo", "email") .sort({ createdAt: -1 });
    } else {
      //  Lookup user ID from email
      const user = await User.findOne({ email });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const userId = user._id;
// @ts-ignore
      jobs = await Job.find({
        $or: [
          { status: "pending" },
          { status: "in_progress", assignedTo: userId },
        ],
      }).sort({ createdAt: -1 });
    }

    return NextResponse.json(jobs);
  } catch (error: unknown) {
  console.error(" Failed to fetch jobs:", error);
  const message = error instanceof Error ? error.message : "Unknown error";
  return NextResponse.json(
    { error: "Failed to fetch jobs", details: message },
    { status: 500 }
  );
}
}

