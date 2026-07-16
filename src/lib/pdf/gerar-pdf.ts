import { NextRequest, NextResponse } from "next/server";
import { launchBrowser } from "@/lib/pdf/launch-browser";

export function slugify(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function gerarPdfDeRota(
  request: NextRequest,
  caminhoInterno: string,
  filename: string,
) {
  const cookies = request.cookies.getAll();
  const origin = request.nextUrl.origin;

  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();

    // deviceScaleFactor 1 (padrão) faz o Chromium arredondar bordas finas
    // (1px) pra posições de sub-pixel na hora de rasterizar o PDF, e elas
    // somem ou ficam apagadas. Em 2, a mesma borda de 1px vira 2 pixels
    // físicos e renderiza nítida — sem precisar engrossar a borda no CSS.
    await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });

    await page.setCookie(
      ...cookies.map((cookie) => ({
        name: cookie.name,
        value: cookie.value,
        domain: request.nextUrl.hostname,
        path: "/",
      })),
    );

    const response = await page.goto(`${origin}${caminhoInterno}`, {
      waitUntil: "networkidle0",
    });

    if (!response || response.status() >= 400) {
      return NextResponse.json(
        { error: "Não foi possível renderizar o documento" },
        { status: 502 },
      );
    }

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } finally {
    await browser.close();
  }
}
