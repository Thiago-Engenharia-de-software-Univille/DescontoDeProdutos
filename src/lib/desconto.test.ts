import { test } from "node:test";
import assert from "node:assert/strict";

import { calcularDesconto, formatarMoeda } from "./desconto.ts";

test("Caso 1: preco R$ 100,00, quantidade 3 -> desconto 5%, final R$ 285,00", () => {
  const r = calcularDesconto(100, 3);
  assert.equal(r.percentualDesconto, 0.05);
  assert.equal(r.valorBruto, 300);
  assert.equal(r.valorDesconto, 15);
  assert.equal(r.valorFinal, 285);
});

test("Caso 2: preco R$ 50,00, quantidade 5 -> desconto 10%, final R$ 225,00", () => {
  const r = calcularDesconto(50, 5);
  assert.equal(r.percentualDesconto, 0.1);
  assert.equal(r.valorBruto, 250);
  assert.equal(r.valorDesconto, 25);
  assert.equal(r.valorFinal, 225);
});

test("Caso 3: preco R$ 30,00, quantidade 10 -> desconto 15%, final R$ 255,00", () => {
  const r = calcularDesconto(30, 10);
  assert.equal(r.percentualDesconto, 0.15);
  assert.equal(r.valorBruto, 300);
  assert.equal(r.valorDesconto, 45);
  assert.equal(r.valorFinal, 255);
});

test("Faixas de desconto conforme a quantidade", () => {
  assert.equal(calcularDesconto(10, 4).percentualDesconto, 0.05);
  assert.equal(calcularDesconto(10, 5).percentualDesconto, 0.1);
  assert.equal(calcularDesconto(10, 9).percentualDesconto, 0.1);
  assert.equal(calcularDesconto(10, 10).percentualDesconto, 0.15);
  assert.equal(calcularDesconto(10, 100).percentualDesconto, 0.15);
});

test("Validacao: preco zero ou negativo e rejeitado", () => {
  assert.throws(() => calcularDesconto(0, 5), /preço unitário deve ser um número maior que zero/);
  assert.throws(() => calcularDesconto(-10, 5), /preço unitário deve ser um número maior que zero/);
});

test("Validacao: quantidade zero, negativa ou fracionaria e rejeitada", () => {
  assert.throws(() => calcularDesconto(10, 0), /quantidade deve ser um número maior que zero/);
  assert.throws(() => calcularDesconto(10, -3), /quantidade deve ser um número maior que zero/);
  assert.throws(() => calcularDesconto(10, 2.5), /quantidade deve ser um número inteiro/);
});

test("formatarMoeda usa o padrao brasileiro", () => {
  const texto = formatarMoeda(285);
  assert.match(texto, /R\$/);
  assert.match(texto, /285,00/);
});
