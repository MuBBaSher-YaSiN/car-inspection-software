import type { Browser } from "puppeteer-core";
import puppeteer from "puppeteer-core";

const LOCAL_CHROME_PATHS = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
].filter(Boolean) as string[];

function isServerless(): boolean {
  return Boolean(
    process.env.AWS_LAMBDA_FUNCTION_VERSION ||
      (process.env.VERCEL && process.env.NODE_ENV === "production")
  );
}

async function resolveLocalChrome(): Promise<string> {
  const { access } = await import("fs/promises");
  for (const path of LOCAL_CHROME_PATHS) {
    try {
      await access(path);
      return path;
    } catch {
      continue;
    }
  }
  throw new Error(
    "No local Chrome found for PDF rendering. Install Google Chrome or set PUPPETEER_EXECUTABLE_PATH."
  );
}

export async function launchBrowser(): Promise<Browser> {
  if (isServerless()) {
    const chromium = (await import("@sparticuz/chromium")).default;
    chromium.setGraphicsMode = false;

    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 794, height: 1123 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  return puppeteer.launch({
    executablePath: await resolveLocalChrome(),
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
  });
}

export async function renderHtmlToPdf(html: string): Promise<Uint8Array> {
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluateHandle("document.fonts.ready");

    const pdf = await page.pdf({
      format: "a4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    return new Uint8Array(pdf);
  } finally {
    await browser.close();
  }
}
