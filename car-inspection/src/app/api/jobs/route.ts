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
    console.log("Received body:", body);

    const parsed = jobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const newJob = await Job.create(parsed.data);
    return NextResponse.json(newJob, { status: 201 });
  } catch (error: any) {
    console.error(" Job creation error:", error);
    return NextResponse.json(
      { error: "Job creation failed", details: error.message },
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
      jobs = await Job.find({}).sort({ createdAt: -1 });
    } else {
      // ✅ Lookup user ID from email
      const user = await User.findOne({ email });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const userId = user._id;

      jobs = await Job.find({
        $or: [
          { status: "pending" },
          { status: "in_progress", assignedTo: userId },
        ],
      }).sort({ createdAt: -1 });
    }

    return NextResponse.json(jobs);
  } catch (error: any) {
    console.error("🔥 Failed to fetch jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs", details: error.message },
      { status: 500 }
    );
  }
}

