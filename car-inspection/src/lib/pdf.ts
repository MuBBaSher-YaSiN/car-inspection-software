// lib/pdf.ts
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { Job } from "@/types/job";
import fs from "fs";
import sharp from "sharp";

export async function generateJobPDF(job: Job): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { height } = page.getSize();

  let y = height - 50;
  const marginX = 50;
  const lineHeight = 18;

  const addPage = () => {
    page = pdfDoc.addPage([595, 842]);
    y = page.getSize().height - 50;
  };

  // ===== Title =====
  page.drawText(`Car Inspection Report`, {
    x: marginX,
    y,
    size: 20,
    font,
    color: rgb(0, 0, 0),
  });
  y -= 30;

  // ===== Basic Info =====
  const basicInfo = [
    `Car Number: ${job.carNumber || "-"}`,
    `Customer: ${job.customerName || "-"}`,
    `Engine Number: ${job.engineNumber || "-"}`,
  ];

  basicInfo.forEach(line => {
    if (y < 60) addPage();
    page.drawText(line, { x: marginX, y, size: 12, font });
    y -= lineHeight;
  });

  y -= 10;

  // ===== Tabs & SubIssues =====
  for (const tab of job.inspectionTabs || []) {
    if (y < 60) addPage();
    page.drawText(tab.label, {
      x: marginX,
      y,
      size: 14,
      font,
      color: rgb(0.1, 0.1, 0.7),
    });
    y -= lineHeight;

    for (const issue of tab.subIssues || []) {
      if (y < 60) addPage();
      page.drawText(`- ${issue.label} [${issue.severity}]`, {
        x: marginX + 10,
        y,
        size: 12,
        font,
      });
      y -= lineHeight;

      if (issue.comment) {
        if (y < 60) addPage();
        page.drawText(`Comment: ${issue.comment}`, {
          x: marginX + 20,
          y,
          size: 10,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
        y -= lineHeight;
      }

      // ===== Images =====
      if (issue.images && issue.images.length > 0) {
        for (const imgSrc of issue.images) {
          try {
            let imgBytes: Uint8Array;

            if (imgSrc.startsWith("data:image/")) {
              imgBytes = Buffer.from(imgSrc.split(",")[1], "base64");
            } else if (imgSrc.startsWith("http")) {
              const res = await fetch(imgSrc);
              imgBytes = Buffer.from(await res.arrayBuffer());
            } else {
              imgBytes = await fs.promises.readFile(imgSrc);
            }

            // Convert WEBP to PNG
            if (imgSrc.includes(".webp") || imgSrc.startsWith("data:image/webp")) {
              imgBytes = await sharp(imgBytes).png().toBuffer();
            }

            // Decide embed method
            let image;
            if (
              imgSrc.includes(".jpg") ||
              imgSrc.includes(".jpeg") ||
              imgSrc.startsWith("data:image/jpeg")
            ) {
              image = await pdfDoc.embedJpg(imgBytes);
            } else {
              image = await pdfDoc.embedPng(imgBytes);
            }

            // Image sizing
            const imgWidth = 100;
            const imgHeight = (image.height / image.width) * imgWidth;

            // Auto-wrap images
            if (y - imgHeight < 50) {
              addPage();
            }

            page.drawImage(image, {
              x: marginX + 20,
              y: y - imgHeight,
              width: imgWidth,
              height: imgHeight,
            });

            y -= imgHeight + 10;
          } catch (err) {
            console.error("Image embedding failed for", imgSrc, err);
          }
        }
      }

      y -= 5;
    }

    y -= 10;
  }

  return await pdfDoc.save();
}
