import { NextRequest, NextResponse } from "next/server";
import { launchBrowser } from "@/lib/pdf/launch-browser";

// Mesma ideia de gerar-pdf.ts, mas devolve um PNG em vez de PDF — mais
// fácil de encaminhar por WhatsApp (abre direto como foto, sem precisar
// de leitor de PDF).
export async function gerarImagemDeRota(
  request: NextRequest,
  caminhoInterno: string,
  filename: string,
) {
  const cookies = request.cookies.getAll();
  const origin = request.nextUrl.origin;

  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
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

    // Emula mídia de impressão pra aplicar as mesmas regras @media print
    // que o page.pdf() já aplica automaticamente (esconde o botão
    // flutuante "Salvar PDF" via .no-print, remove o padding/fundo cinza
    // do wrapper de visualização). Depois tira o screenshot só da página
    // A4 em si (não da tela toda), pra não pegar sobra de fundo/margem
    // ao redor.
    await page.emulateMediaType("print");
    const pagina = await page.$("[data-print-pagina]");
    const imagemBuffer = pagina
      ? await pagina.screenshot({ type: "png" })
      : await page.screenshot({ type: "png", fullPage: true });

    return new NextResponse(Buffer.from(imagemBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } finally {
    await browser.close();
  }
}
