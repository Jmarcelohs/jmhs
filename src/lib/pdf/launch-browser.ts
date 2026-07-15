import type { Browser as CoreBrowser } from "puppeteer-core";
import type { Browser } from "puppeteer";

// Local (Windows, desenvolvimento): usa o Chromium completo baixado pelo
// pacote "puppeteer". Na Vercel (serverless): usa puppeteer-core com o
// @sparticuz/chromium, que é compatível com o runtime e cabe no limite de
// tamanho da function. Ver next.config.ts (outputFileTracingExcludes) —
// é o que impede o Chromium local de ir junto no bundle de produção.
export async function launchBrowser(): Promise<Browser | CoreBrowser> {
  if (process.env.VERCEL) {
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteerCore = await import("puppeteer-core");
    return puppeteerCore.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const puppeteer = (await import("puppeteer")).default;
  return puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}
