import type { Browser as CoreBrowser } from "puppeteer-core";
import type { Browser } from "puppeteer";

// URL oficial do pacote pré-compilado do Chromium, publicado pelo próprio
// mantenedor do @sparticuz/chromium (github.com/Sparticuz/chromium). Precisa
// bater com a versão instalada em package.json.
const CHROMIUM_PACK_URL =
  "https://github.com/Sparticuz/chromium/releases/download/v149.0.0/chromium-v149.0.0-pack.x64.tar";

// Local (Windows, desenvolvimento): usa o Chromium completo baixado pelo
// pacote "puppeteer". Na Vercel (serverless): usa puppeteer-core com o
// @sparticuz/chromium-min, que baixa o Chromium do pack acima em tempo de
// execução (cacheado em /tmp entre chamadas) — o rastreamento automático de
// arquivos do Next/Turbopack não inclui de forma confiável o binário do
// pacote completo "@sparticuz/chromium" no bundle da function, então essa
// é a forma que realmente funciona na Vercel hoje.
export async function launchBrowser(): Promise<Browser | CoreBrowser> {
  if (process.env.VERCEL) {
    const chromium = (await import("@sparticuz/chromium-min")).default;
    const puppeteerCore = await import("puppeteer-core");
    return puppeteerCore.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(CHROMIUM_PACK_URL),
      headless: true,
    });
  }

  const puppeteer = (await import("puppeteer")).default;
  return puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}
