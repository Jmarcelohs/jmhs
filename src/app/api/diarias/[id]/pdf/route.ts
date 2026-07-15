import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { createClient } from "@/lib/supabase/server";

function slugify(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: solicitacao } = await supabase
    .from("diarias_solicitacoes")
    .select("numero_diaria, pessoas(nome)")
    .eq("id", id)
    .single();

  if (!solicitacao) {
    return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 });
  }

  const pessoa = solicitacao.pessoas as unknown as { nome: string } | null;
  const partes = ["anexo-i"];
  if (solicitacao.numero_diaria) partes.push(`diaria-${slugify(solicitacao.numero_diaria)}`);
  if (pessoa?.nome) partes.push(slugify(pessoa.nome));
  const filename = `${partes.join("-").toLowerCase()}.pdf`;

  const cookies = request.cookies.getAll();
  const origin = request.nextUrl.origin;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.setCookie(
      ...cookies.map((cookie) => ({
        name: cookie.name,
        value: cookie.value,
        domain: request.nextUrl.hostname,
        path: "/",
      })),
    );

    const response = await page.goto(`${origin}/diarias/${id}/imprimir`, {
      waitUntil: "networkidle0",
    });

    if (!response || response.status() >= 400) {
      return NextResponse.json({ error: "Não foi possível renderizar o documento" }, { status: 502 });
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
