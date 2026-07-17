export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

export function formatarCpfDigitado(valor: string): string {
  const digitos = apenasDigitos(valor).slice(0, 11);
  const partes = [digitos.slice(0, 3), digitos.slice(3, 6), digitos.slice(6, 9), digitos.slice(9, 11)].filter(
    Boolean,
  );

  let texto = partes[0] ?? "";
  if (partes[1]) texto += `.${partes[1]}`;
  if (partes[2]) texto += `.${partes[2]}`;
  if (partes[3]) texto += `-${partes[3]}`;
  return texto;
}

// Máscara de moeda "digitando da direita pra esquerda": trata o texto
// digitado como centavos (ex.: "282582" → R$ 2.825,82).
export function formatarValorDigitado(valorDigitado: string): { texto: string; valor: number } {
  const digitos = apenasDigitos(valorDigitado);
  const centavos = Number(digitos || "0");
  const valor = centavos / 100;
  const texto = valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return { texto, valor };
}
