// lib/pdf.ts
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { Job } from "@/types/job";

export async function generateJobPDF(job: Job, logoBytes?: Uint8Array): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { height, width } = page.getSize();

  let y = height - 70;
  const marginX = 40;

  const lineHeight = 18;

  // ====== Modern Gradient Header ======
  const headerHeight = 100;
  const gradientSteps = 20;
  const gradientWidth = width / gradientSteps;
  
  for (let i = 0; i < gradientSteps; i++) {
    const progress = i / gradientSteps;
    const color = rgb(
      0.35 - progress * 0.25,
      0.1 + progress * 0.3,
      0.6 + progress * 0.2
    );
    
    page.drawRectangle({
      x: i * gradientWidth,
      y: height - headerHeight,
      width: gradientWidth,
      height: headerHeight,
      color,
    });
  }

  // ====== Logo ======
  if (logoBytes) {
    try {
      const logoImg = await pdfDoc.embedPng(logoBytes);
      page.drawImage(logoImg, {
        x: marginX,
        y: height - 80,
        width: 100,
        height: 50,
      });
    } catch (e) {
      console.warn("Logo embedding failed", e);
    }
  }

  // ====== Title ======
  page.drawText("CAR INSPECTION REPORT", {
    x: marginX + 120,
    y: height - 65,
    size: 24,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  page.drawText("Comprehensive Vehicle Assessment", {
    x: marginX + 120,
    y: height - 85,
    size: 12,
    font,
    color: rgb(0.9, 0.9, 0.9),
  });

  y = height - 140;

  // ====== ORIGINAL INFO BOX CODE (with slight visual enhancement) ======
  page.drawRectangle({
    x: marginX,
    y: y - 70,
    width: width - marginX * 2,
    height: 70,
    borderColor: rgb(0.7, 0.7, 0.7),
    borderWidth: 1,
    color: rgb(0.96, 0.96, 1),
    borderRadius: 5,
  });
  
  const infoLeft = [
    `FILE #: ${job.id || "-"}`,
    `CHASSIS #: ${job.engineNumber || "-"}`,
  ];
  const infoRight = [
    `INSPECTOR: ${job.customerName || "-"}`,
    `DATE: ${new Date().toISOString().slice(0, 10)}`,
  ];
  
  let infoY = y - 20;
  infoLeft.forEach((line) => {
    page.drawText(line, { x: marginX + 10, y: infoY, size: 11, font });
    infoY -= 15;
  });
  
  infoY = y - 20;
  infoRight.forEach((line) => {
    page.drawText(line, {
      x: width / 2 + 20,
      y: infoY,
      size: 11,
      font,
    });
    infoY -= 15;
  });

  y -= 110;

  // ====== ORIGINAL SUMMARY BADGES CODE (with visual enhancement) ======
  page.drawText("Summary of Inspection", {
    x: marginX,
    y,
    size: 14,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.5),
  });
  y -= 30;

  const summary = {
    Okay: job.inspectionTabs?.flatMap(t => t.subIssues).filter(i => i.severity === "ok").length || 0,
    Minor: job.inspectionTabs?.flatMap(t => t.subIssues).filter(i => i.severity === "minor").length || 0,
    Major: job.inspectionTabs?.flatMap(t => t.subIssues).filter(i => i.severity === "major").length || 0,
  };
  
  const badgeColors: Record<string, [number, number, number]> = {
    Okay: [0.1, 0.7, 0.2],
    Minor: [0.95, 0.6, 0.1],
    Major: [0.9, 0.2, 0.2],
  };

  let xPos = marginX;
  Object.entries(summary).forEach(([label, count]) => {
    const color = rgb(...badgeColors[label]);
    page.drawRectangle({
      x: xPos,
      y: y - 5,
      width: 90,
      height: 25,
      color,
      borderRadius: 5,
    });
    page.drawText(`${label}: ${count}`, {
      x: xPos + 10,
      y: y,
      size: 11,
      font: boldFont,
      color: rgb(1, 1, 1),
    });
    xPos += 110;
  });

  y -= 60;

  // ====== ORIGINAL ISSUES GROUPED CODE (with visual enhancement) ======
  const grouped: Record<string, typeof job.inspectionTabs[0]["subIssues"]> = {
    Minor: [],
    Major: [],
    OK: [],
  };
  
  for (const tab of job.inspectionTabs || []) {
    for (const issue of tab.subIssues || []) {
      if (issue.severity === "minor") grouped.Minor.push(issue);
      if (issue.severity === "major") grouped.Major.push(issue);
      if (issue.severity === "ok") grouped.OK.push(issue);
    }
  }

  const sectionColors: Record<string, [number, number, number]> = {
    Minor: [1, 0.97, 0.9],
    Major: [1, 0.95, 0.95],
    OK: [0.95, 0.98, 1],
  };

  for (const severity of Object.keys(grouped)) {
    if (grouped[severity].length > 0) {
      // Enhanced section header
      page.drawRectangle({
        x: marginX,
        y: y - 20,
        width: width - marginX * 2,
        height: 22,
        color: rgb(...sectionColors[severity]),
        borderRadius: 4,
      });
      
      page.drawText(severity, {
        x: marginX + 10,
        y: y - 5,
        size: 12,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      
      y -= 40;
      
      for (const issue of grouped[severity]) {
        page.drawText(`- ${issue.label}`, {
          x: marginX + 15,
          y,
          size: 11,
          font,
          color: rgb(0, 0, 0),
        });
        
        y -= lineHeight;
        
        if (issue.comment) {
          page.drawText(`Comment: ${issue.comment}`, {
            x: marginX + 30,
            y,
            size: 10,
            font,
            color: rgb(0.3, 0.3, 0.3),
          });
          y -= lineHeight;
        }
      }
      y -= 20;
    }
  }

  // ====== Footer ======
  page.drawText(`Generated on ${new Date().toLocaleString()}`, {
    x: marginX,
    y: 30,
    size: 9,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  return await pdfDoc.save();
}