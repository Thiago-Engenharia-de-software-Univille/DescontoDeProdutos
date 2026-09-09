"use client";

import Link from "next/link";
import { useState } from "react";

import {
  calcularDesconto,
  formatarMoeda,
  formatarPercentual,
  type ResultadoDesconto,
} from "@/lib/desconto";
import TemaToggle from "./TemaToggle";
import styles from "./page.module.css";

type Separador = "," | ".";

const CASOS_TESTE = [
  { preco: "100", quantidade: "3" },
  { preco: "50", quantidade: "5" },
  { preco: "30", quantidade: "10" },
];

/** Mantém apenas dígitos e, no máximo, um separador decimal. */
function limparPreco(valor: string, separador: Separador): string {
  const escapado = separador === "." ? "\\." : ",";
  let limpo = valor.replace(new RegExp(`[^0-9${escapado}]`, "g"), "");
  const primeiro = limpo.indexOf(separador);
  if (primeiro !== -1) {
    limpo =
      limpo.slice(0, primeiro + 1) +
      limpo.slice(primeiro + 1).replace(new RegExp(escapado, "g"), "");
  }
  return limpo;
}

/** Mantém apenas dígitos (quantidade é sempre inteira). */
function limparQuantidade(valor: string): string {
  return valor.replace(/\D/g, "");
}

function paraNumero(valor: string, separador: Separador): number {
  return Number(valor.split(separador).join("."));
}

export default function Home() {
  const [separador, setSeparador] = useState<Separador>(",");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [resultado, setResultado] = useState<ResultadoDesconto | null>(null);
  const [erro, setErro] = useState("");

  const exemploPreco = separador === "," ? "100,00" : "100.00";

  function trocarSeparador(novo: Separador) {
    setPreco((p) => p.replace(/[.,]/g, novo));
    setSeparador(novo);
  }

  function calcular(precoTexto: string, quantidadeTexto: string) {
    try {
      setResultado(
        calcularDesconto(
          paraNumero(precoTexto, separador),
          paraNumero(quantidadeTexto, separador),
        ),
      );
      setErro("");
    } catch (e) {
      setResultado(null);
      setErro(e instanceof Error ? e.message : "Não foi possível calcular.");
    }
  }

  function aoEnviar(evento: React.SyntheticEvent) {
    evento.preventDefault();
    calcular(preco, quantidade);
  }

  return (
    <main className={styles.pagina}>
      <div className={styles.barraTopo}>
        <Link href="/como-e-feito" className={styles.link}>
          Como o código é feito &rarr;
        </Link>
        <TemaToggle />
      </div>

      <header className={styles.cabecalho}>
        Univille &middot; Desenvolvimento Web
      </header>

      <h1 className={styles.titulo}>Calculadora de Desconto de Produtos</h1>

      <p>O desconto muda conforme a quantidade comprada:</p>
      <ul className={styles.regras}>
        <li>menos de 5 unidades: 5% de desconto</li>
        <li>de 5 a 9 unidades: 10% de desconto</li>
        <li>10 unidades ou mais: 15% de desconto</li>
      </ul>

      <form className={styles.formulario} onSubmit={aoEnviar}>
        <fieldset className={styles.separador}>
          <legend>Separador decimal</legend>
          <label>
            <input
              type="radio"
              name="separador"
              checked={separador === ","}
              onChange={() => trocarSeparador(",")}
            />
            Vírgula (100,00)
          </label>
          <label>
            <input
              type="radio"
              name="separador"
              checked={separador === "."}
              onChange={() => trocarSeparador(".")}
            />
            Ponto (100.00)
          </label>
        </fieldset>

        <label className={styles.campo}>
          Preço unitário (R$)
          <input
            type="text"
            inputMode="decimal"
            value={preco}
            onChange={(e) => setPreco(limparPreco(e.target.value, separador))}
            placeholder={exemploPreco}
          />
          <span className={styles.dica}>
            Somente números e {separador === "," ? "vírgula" : "ponto"}. Exemplo:{" "}
            {exemploPreco}
          </span>
        </label>

        <label className={styles.campo}>
          Quantidade comprada
          <input
            type="text"
            inputMode="numeric"
            value={quantidade}
            onChange={(e) => setQuantidade(limparQuantidade(e.target.value))}
            placeholder="3"
          />
          <span className={styles.dica}>
            Somente números inteiros. Exemplo: 3
          </span>
        </label>

        <button type="submit">Calcular</button>
      </form>

      {erro && <p className={styles.erro}>{erro}</p>}

      {resultado && (
        <table className={styles.resultado}>
          <tbody>
            <tr>
              <td>Valor bruto</td>
              <td>{formatarMoeda(resultado.valorBruto)}</td>
            </tr>
            <tr>
              <td>Desconto aplicado</td>
              <td>{formatarPercentual(resultado.percentualDesconto)}</td>
            </tr>
            <tr>
              <td>Valor do desconto</td>
              <td>{formatarMoeda(resultado.valorDesconto)}</td>
            </tr>
            <tr className={styles.linhaFinal}>
              <td>Valor final</td>
              <td>{formatarMoeda(resultado.valorFinal)}</td>
            </tr>
          </tbody>
        </table>
      )}

      <section className={styles.testes}>
        <h2>Casos de teste</h2>
        <div className={styles.botoesTeste}>
          {CASOS_TESTE.map((caso) => (
            <button
              key={caso.preco + caso.quantidade}
              type="button"
              onClick={() => {
                setPreco(caso.preco);
                setQuantidade(caso.quantidade);
                calcular(caso.preco, caso.quantidade);
              }}
            >
              R$ {caso.preco} &times; {caso.quantidade}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
