// lib/pdf.ts
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { Job } from "@/types/job";
import fs from "fs";
import sharp from "sharp";

/**
 * Helper: Wrap text to fit within maxWidth
 */
function wrapText(
  text: string,
  font: any,
  fontSize: number,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? currentLine + " " + word : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export async function generateJobPDF(job: Job): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { height, width } = page.getSize();

  let y = height - 50;
  const marginX = 50;
  const lineHeight = 18;
  const usableWidth = width - marginX * 2 - 20; // page width minus margins & indent

  const addPage = () => {
    page = pdfDoc.addPage([595, 842]);
    y = page.getSize().height - 50;
  };

  /**
   * Draws multi-line wrapped text
   */
  const drawWrappedText = (
    text: string,
    x: number,
    fontSize: number,
    color = rgb(0, 0, 0)
  ) => {
    const lines = wrapText(text, font, fontSize, usableWidth - (x - marginX));
    for (const line of lines) {
      if (y < 60) addPage();
      page.drawText(line, { x, y, size: fontSize, font, color });
      y -= lineHeight;
    }
  };

  // ===== Title =====
  drawWrappedText(`Car Inspection Report`, marginX, 20);

  y -= 10;

  // ===== Basic Info =====
  const basicInfo = [
    `Car Number: ${job.carNumber || "-"}`,
    `Customer: ${job.customerName || "-"}`,
    `Engine Number: ${job.engineNumber || "-"}`,
  ];
  basicInfo.forEach(line => drawWrappedText(line, marginX, 12));

  y -= 10;

  // ===== Tabs & SubIssues =====
  for (const tab of job.inspectionTabs || []) {
    drawWrappedText(tab.label, marginX, 14, rgb(0.1, 0.1, 0.7));

    for (const issue of tab.subIssues || []) {
      drawWrappedText(`- ${issue.label} [${issue.severity}]`, marginX + 10, 12);

      if (issue.comment) {
        drawWrappedText(`Comment: ${issue.comment}`, marginX + 20, 10, rgb(0.3, 0.3, 0.3));
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

            // Ensure space before image
            if (y - imgHeight < 50) addPage();

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
