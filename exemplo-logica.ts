/**
 * EXEMPLO DA LÓGICA — Calculadora de Desconto de Produtos
 * =======================================================
 *
 * Este arquivo é uma versão ENXUTA e AUTOCONTIDA da regra de negócio,
 * feita para leitura/demonstração. A versão usada pelo site está em
 * `src/lib/desconto.ts` (é praticamente igual a esta).
 *
 * Como rodar:
 *   node exemplo-logica.ts        (Node 24+, executa TypeScript direto)
 *   npx tsx exemplo-logica.ts     (alternativa)
 *   npm run exemplo
 *
 * Regras de desconto (pela quantidade comprada):
 *   quantidade < 5          -> 5%
 *   quantidade de 5 a 9     -> 10%
 *   quantidade >= 10        -> 15%
 *
 * Cálculos:
 *   valorBruto    = precoUnitario * quantidade
 *   valorDesconto = valorBruto * percentualDesconto
 *   valorFinal    = valorBruto - valorDesconto
 */

/** Formato do resultado devolvido pelo cálculo. */
interface ResultadoDesconto {
  valorBruto: number;
  percentualDesconto: number; // fração: 0.05, 0.10 ou 0.15
  valorDesconto: number;
  valorFinal: number;
}

/**
 * Passo 1 — descobrir o percentual de desconto a partir da quantidade.
 * A ordem das comparações importa: testamos primeiro a faixa maior.
 */
function obterPercentualDesconto(quantidade: number): number {
  if (quantidade >= 10) return 0.15; // 15%
  if (quantidade >= 5) return 0.1; //  10% (cobre de 5 a 9)
  return 0.05; //                      5%  (cobre de 1 a 4)
}

/**
 * Passo 2 — validar as entradas e, se estiverem ok, calcular tudo.
 * Preço e quantidade precisam ser números maiores que zero;
 * a quantidade ainda precisa ser inteira (não existe "2,5 unidades").
 */
function calcularDesconto(
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

  return { valorBruto, percentualDesconto, valorDesconto, valorFinal };
}

/** Passo 3 — formatar um número no padrão de moeda do Brasil (R$). */
function real(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ---------------------------------------------------------------------------
// DEMONSTRAÇÃO — os 3 casos exigidos no enunciado
// ---------------------------------------------------------------------------

const casos = [
  { preco: 100, quantidade: 3, valorFinalEsperado: 285 },
  { preco: 50, quantidade: 5, valorFinalEsperado: 225 },
  { preco: 30, quantidade: 10, valorFinalEsperado: 255 },
];

console.log("=== Casos do enunciado ===");
for (const caso of casos) {
  const r = calcularDesconto(caso.preco, caso.quantidade);
  const confere = r.valorFinal === caso.valorFinalEsperado;

  console.log(`\nPreço ${real(caso.preco)}  x  ${caso.quantidade} unidade(s)`);
  console.log(`  valor bruto ......... ${real(r.valorBruto)}`);
  console.log(`  desconto aplicado ... ${r.percentualDesconto * 100}%`);
  console.log(`  valor do desconto ... ${real(r.valorDesconto)}`);
  console.log(`  valor final ......... ${real(r.valorFinal)}`);
  console.log(`  bate com o esperado? ${confere ? "SIM" : "NAO"}`);
}

// ---------------------------------------------------------------------------
// DEMONSTRAÇÃO — entradas inválidas são recusadas com mensagem clara
// ---------------------------------------------------------------------------

console.log("\n=== Entradas inválidas ===");
const invalidas: Array<[number, number]> = [
  [0, 5],
  [-10, 5],
  [100, 0],
  [100, 2.5],
];

for (const [preco, quantidade] of invalidas) {
  try {
    calcularDesconto(preco, quantidade);
    console.log(`  calcularDesconto(${preco}, ${quantidade})  ->  (não deveria passar)`);
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : String(erro);
    console.log(`  calcularDesconto(${preco}, ${quantidade})  ->  ${mensagem}`);
  }
}
