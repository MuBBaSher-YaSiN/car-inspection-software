// src/app/api/pdf/[id]/route.ts
import { connectToDB } from "@/lib/db";
import { Job } from "@/models/Job";
import { generateJobPDF } from "@/lib/pdf";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDB();

    const job = await Job.findById(params.id)
      .populate("assignedTo", "email")
      .lean();

    if (!job)
      return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const pdfBuffer = await generateJobPDF(job);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=inspection-${params.id}.pdf`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 }
    );
  }
}
