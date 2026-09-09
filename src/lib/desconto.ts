/**
 * Regras de negócio da calculadora de desconto de produtos.
 *
 * Regras de desconto por quantidade:
 *   - quantidade >= 10            -> 15%
 *   - quantidade entre 5 e 9      -> 10%
 *   - quantidade < 5              -> 5%
 */

export interface ResultadoDesconto {
  precoUnitario: number;
  quantidade: number;
  percentualDesconto: number; // fração: 0.05, 0.10 ou 0.15
  valorBruto: number;
  valorDesconto: number;
  valorFinal: number;
}

/** Retorna o percentual de desconto (em fração) para a quantidade informada. */
export function obterPercentualDesconto(quantidade: number): number {
  if (quantidade >= 10) return 0.15;
  if (quantidade >= 5) return 0.1;
  return 0.05;
}

/**
 * Calcula o desconto a partir do preço unitário e da quantidade.
 * Lança Error com mensagem clara quando os dados são inválidos.
 */
export function calcularDesconto(
  precoUnitario: number,
  quantidade: number,
): ResultadoDesconto {
  if (!Number.isFinite(precoUnitario) || precoUnitario <= 0) {
    throw new Error("O preço unitário deve ser um número maior que zero.");
  }
  if (!Number.isFinite(quantidade) || quantidade <= 0) {
    throw new Error("A quantidade deve ser um número maior que zero.");
  }
  if (!Number.isInteger(quantidade)) {
    throw new Error("A quantidade deve ser um número inteiro.");
  }

  const percentualDesconto = obterPercentualDesconto(quantidade);
  const valorBruto = precoUnitario * quantidade;
  const valorDesconto = valorBruto * percentualDesconto;
  const valorFinal = valorBruto - valorDesconto;

  return {
    precoUnitario,
    quantidade,
    percentualDesconto,
    valorBruto,
    valorDesconto,
    valorFinal,
  };
}

/** Formata um número como moeda brasileira (R$). */
export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Formata uma fração (0.15) como percentual ("15%"). */
export function formatarPercentual(fracao: number): string {
  return `${(fracao * 100).toLocaleString("pt-BR", {
    maximumFractionDigits: 2,
  })}%`;
}
