// src/lib/pdf.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { JobType } from '@/types/job';

export async function generateJobPDF(job: JobType): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { width, height } = page.getSize();

  let y = height - 50;

  page.drawText(`Car Inspection Report`, {
    x: 50,
    y,
    size: 20,
    font,
    color: rgb(0, 0, 0),
  });

  y -= 40;

  const lines = [
    `Car Number: ${job.carNumber}`,
    `Customer: ${job.customerName}`,
    `Engine Number: ${job.engineNumber || '-'}`,
    `Status: ${job.status}`,
    `Assigned To: ${job.assignedTo?.email || 'Unassigned'}`,
    `Issues Count: ${job.issues?.length || 0}`,
  ];

  lines.forEach(line => {
    page.drawText(line, { x: 50, y, size: 12, font });
    y -= 20;
  });

  if (job.issues && job.issues.length > 0) {
    y -= 10;
    page.drawText('Issues:', { x: 50, y, size: 14, font });
    y -= 20;
    job.issues.forEach((issue, idx) => {
      page.drawText(`${idx + 1}. ${issue.description}`, { x: 60, y, size: 12, font });
      y -= 16;
    });
  }

  return await pdfDoc.save();
}
