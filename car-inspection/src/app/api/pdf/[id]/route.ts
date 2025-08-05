import { connectToDB } from "@/lib/db";
import { Job } from "@/models/Job";
import { generateJobPDF } from "@/lib/pdf";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(
  _: Request,
  context: { params: { id: string } }
) {
  const { params } = context;

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
    const error = err as Error;
    return NextResponse.json(
      { error: "PDF generation failed", details: error.message },
      { status: 500 }
    );
  }
}
