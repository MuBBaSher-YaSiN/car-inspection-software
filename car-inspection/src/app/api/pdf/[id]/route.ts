// @ts-nocheck

import { connectToDB } from "@/lib/db";
import { Job } from "@/models/Job";
import { generateJobPDF } from "@/lib/pdf";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(
  req: Request,
  context: { params?: { id?: string } } // mark optional to prevent type error
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    //  Safely access the dynamic param
    const id = context?.params?.id;

    if (!id) {
      return NextResponse.json({ error: "Job ID missing" }, { status: 400 });
    }

    const job = await Job.findById(id)
      .populate("assignedTo", "email")
      .lean();

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const pdfBuffer = await generateJobPDF(job);

    const safeCustomerName =
      job.customerName?.toString().trim().replace(/[^a-z0-9]/gi, "_").toLowerCase() || "unknown";

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=inspection-${safeCustomerName}.pdf`,
      },
    });
  } catch (err) {
    console.error(" PDF generation failed:", err);
    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 }
    );
  }
}
