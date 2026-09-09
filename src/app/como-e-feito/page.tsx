"use client";

import Link from "next/link";
import { useState } from "react";

import TemaToggle from "../TemaToggle";
import styles from "./codigo.module.css";

type Aba = "js" | "ts" | "react";

const HTML_EXEMPLO = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Calculadora de Desconto</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h1>Calculadora de Desconto de Produtos</h1>

  <label>
    Preço unitário (R$)
    <input id="preco" type="text" inputmode="decimal" placeholder="100,00" />
  </label>

  <label>
    Quantidade comprada
    <input id="quantidade" type="text" inputmode="numeric" placeholder="3" />
  </label>

  <button id="calcular">Calcular</button>

  <p id="erro" class="erro"></p>
  <div id="resultado"></div>

  <script src="script.js"></script>
</body>
</html>`;

const CSS_EXEMPLO = `body {
  font-family: Arial, Helvetica, sans-serif;
  max-width: 480px;
  margin: 40px auto;
  padding: 0 16px;
  color: #333;
}

h1 { color: #4a4a4a; font-size: 1.4rem; }

label { display: block; margin-bottom: 12px; font-weight: bold; }

input {
  display: block;
  width: 100%;
  padding: 8px;
  margin-top: 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background: #c6d600;   /* lima da Univille */
  font-weight: bold;
  cursor: pointer;
}

.erro { color: #c0392b; }

#resultado { margin-top: 16px; line-height: 1.8; }`;

const JS_EXEMPLO = `// script.js  -  JavaScript puro, sem framework

// 1) Regra do desconto conforme a quantidade
function obterPercentualDesconto(quantidade) {
  if (quantidade >= 10) return 0.15;  // 15%
  if (quantidade >= 5) return 0.10;   // 10%
  return 0.05;                        //  5%
}

// 2) Validação + cálculo
function calcularDesconto(preco, quantidade) {
  if (!isFinite(preco) || preco <= 0) {
    throw new Error("O preço deve ser um número maior que zero.");
  }
  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    throw new Error("A quantidade deve ser um inteiro maior que zero.");
  }

  var percentual = obterPercentualDesconto(quantidade);
  var bruto = preco * quantidade;
  var desconto = bruto * percentual;
  var final = bruto - desconto;
  return { percentual: percentual, bruto: bruto, desconto: desconto, final: final };
}

// 3) Formatar em Real
function real(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// 4) Ligar tudo ao botão da tela
document.getElementById("calcular").addEventListener("click", function () {
  var preco = Number(document.getElementById("preco").value.replace(",", "."));
  var quantidade = Number(document.getElementById("quantidade").value);
  var erro = document.getElementById("erro");
  var resultado = document.getElementById("resultado");

  try {
    var r = calcularDesconto(preco, quantidade);
    erro.textContent = "";
    resultado.innerHTML =
      "Valor bruto: " + real(r.bruto) + "<br>" +
      "Desconto aplicado: " + (r.percentual * 100) + "%<br>" +
      "Valor do desconto: " + real(r.desconto) + "<br>" +
      "<strong>Valor final: " + real(r.final) + "</strong>";
  } catch (e) {
    resultado.innerHTML = "";
    erro.textContent = e.message;
  }
});`;

const TS_EXEMPLO = `// script.ts  -  mesmo código, agora com TypeScript
// (compila para script.js com:  npx tsc script.ts)

interface Resultado {
  percentual: number;
  bruto: number;
  desconto: number;
  final: number;
}

// 1) Regra do desconto conforme a quantidade
function obterPercentualDesconto(quantidade: number): number {
  if (quantidade >= 10) return 0.15;  // 15%
  if (quantidade >= 5) return 0.10;   // 10%
  return 0.05;                        //  5%
}

// 2) Validação + cálculo
function calcularDesconto(preco: number, quantidade: number): Resultado {
  if (!isFinite(preco) || preco <= 0) {
    throw new Error("O preço deve ser um número maior que zero.");
  }
  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    throw new Error("A quantidade deve ser um inteiro maior que zero.");
  }

  const percentual = obterPercentualDesconto(quantidade);
  const bruto = preco * quantidade;
  const desconto = bruto * percentual;
  const final = bruto - desconto;
  return { percentual, bruto, desconto, final };
}

// 3) Formatar em Real
function real(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// 4) Ligar tudo ao botão da tela (com os tipos dos elementos HTML)
const botao = document.getElementById("calcular") as HTMLButtonElement;

botao.addEventListener("click", () => {
  const campoPreco = document.getElementById("preco") as HTMLInputElement;
  const campoQtd = document.getElementById("quantidade") as HTMLInputElement;
  const erro = document.getElementById("erro") as HTMLElement;
  const resultado = document.getElementById("resultado") as HTMLElement;

  const preco = Number(campoPreco.value.replace(",", "."));
  const quantidade = Number(campoQtd.value);

  try {
    const r = calcularDesconto(preco, quantidade);
    erro.textContent = "";
    resultado.innerHTML =
      "Valor bruto: " + real(r.bruto) + "<br>" +
      "Desconto aplicado: " + (r.percentual * 100) + "%<br>" +
      "Valor do desconto: " + real(r.desconto) + "<br>" +
      "<strong>Valor final: " + real(r.final) + "</strong>";
  } catch (e) {
    resultado.innerHTML = "";
    erro.textContent = e instanceof Error ? e.message : "Erro ao calcular.";
  }
});`;

const REACT_EXEMPLO = `// Calculadora.tsx  -  abordagem usada neste site (React + TypeScript)

import { useState } from "react";

interface Resultado {
  percentual: number;
  bruto: number;
  desconto: number;
  final: number;
}

function obterPercentualDesconto(quantidade: number): number {
  if (quantidade >= 10) return 0.15;
  if (quantidade >= 5) return 0.10;
  return 0.05;
}

function calcularDesconto(preco: number, quantidade: number): Resultado {
  if (!isFinite(preco) || preco <= 0) {
    throw new Error("O preço deve ser um número maior que zero.");
  }
  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    throw new Error("A quantidade deve ser um inteiro maior que zero.");
  }
  const percentual = obterPercentualDesconto(quantidade);
  const bruto = preco * quantidade;
  const desconto = bruto * percentual;
  return { percentual, bruto, desconto, final: bruto - desconto };
}

function real(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Calculadora() {
  // cada "estado" redesenha a tela quando muda
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [erro, setErro] = useState("");

  function calcular(evento: React.SyntheticEvent) {
    evento.preventDefault();
    try {
      const r = calcularDesconto(
        Number(preco.replace(",", ".")),
        Number(quantidade),
      );
      setResultado(r);
      setErro("");
    } catch (e) {
      setResultado(null);
      setErro(e instanceof Error ? e.message : "Erro ao calcular.");
    }
  }

  return (
    <form onSubmit={calcular}>
      <label>
        Preço unitário (R$)
        <input value={preco} onChange={(e) => setPreco(e.target.value)} />
      </label>

      <label>
        Quantidade comprada
        <input
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
        />
      </label>

      <button type="submit">Calcular</button>

      {erro && <p className="erro">{erro}</p>}

      {resultado && (
        <div>
          <p>Valor bruto: {real(resultado.bruto)}</p>
          <p>Desconto aplicado: {resultado.percentual * 100}%</p>
          <p>Valor do desconto: {real(resultado.desconto)}</p>
          <p><strong>Valor final: {real(resultado.final)}</strong></p>
        </div>
      )}
    </form>
  );
}`;

const EXPLICACOES: Record<Aba, string> = {
  js: "JavaScript puro: um arquivo HTML com o formulário, um CSS e um script que pega os valores dos campos pelo id, faz a conta e escreve o resultado na tela. Não precisa de instalação nem build.",
  ts: "TypeScript: o mesmo código, mas com os tipos declarados (number, string, os tipos dos elementos HTML). O navegador não entende .ts direto, então antes é preciso compilar para .js. Os tipos ajudam a pegar erros enquanto se escreve.",
  react:
    "React (o que este site usa): em vez de mexer no HTML na mão, a tela é uma função que descreve o que aparece a partir dos estados. Quando um estado muda (preço, quantidade, resultado, erro), o React redesenha só o que mudou.",
};

export default function ComoEFeito() {
  const [aba, setAba] = useState<Aba>("js");

  const abas: { id: Aba; rotulo: string }[] = [
    { id: "js", rotulo: "JavaScript" },
    { id: "ts", rotulo: "TypeScript" },
    { id: "react", rotulo: "React" },
  ];

  return (
    <main className={styles.pagina}>
      <div className={styles.barraTopo}>
        <Link href="/" className={styles.link}>
          &larr; Voltar para a calculadora
        </Link>
        <TemaToggle />
      </div>

      <h1 className={styles.titulo}>Como este código pode ser feito</h1>
      <p className={styles.intro}>
        A mesma calculadora escrita de três formas. Use os botões para trocar
        entre JavaScript, TypeScript e React (a abordagem usada neste site).
      </p>

      <div className={styles.abas}>
        {abas.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              aba === item.id ? `${styles.aba} ${styles.abaAtiva}` : styles.aba
            }
            onClick={() => setAba(item.id)}
          >
            {item.rotulo}
          </button>
        ))}
      </div>

      <p className={styles.explica}>{EXPLICACOES[aba]}</p>

      {aba !== "react" && (
        <>
          <div className={styles.bloco}>
            <h2>Estrutura da página</h2>
            <p className={styles.arquivo}>index.html</p>
            <pre className={styles.codigo}>{HTML_EXEMPLO}</pre>
          </div>

          <div className={styles.bloco}>
            <h2>Estilo</h2>
            <p className={styles.arquivo}>style.css</p>
            <pre className={styles.codigo}>{CSS_EXEMPLO}</pre>
          </div>
        </>
      )}

      <div className={styles.bloco}>
        <h2>Lógica</h2>
        <p className={styles.arquivo}>
          {aba === "js"
            ? "script.js"
            : aba === "ts"
              ? "script.ts"
              : "Calculadora.tsx"}
        </p>
        <pre className={styles.codigo}>
          {aba === "js"
            ? JS_EXEMPLO
            : aba === "ts"
              ? TS_EXEMPLO
              : REACT_EXEMPLO}
        </pre>
      </div>

      <p className={styles.rodape}>
        A versão que está no ar é a de React. O código real fica em{" "}
        <code>src/app/page.tsx</code> (tela) e <code>src/lib/desconto.ts</code>{" "}
        (lógica), explicado no arquivo <code>EXPLICACAO.md</code>.
      </p>
    </main>
  );
}
