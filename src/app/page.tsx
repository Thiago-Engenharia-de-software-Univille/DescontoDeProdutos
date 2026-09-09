"use client";

import { useState } from "react";

import {
  calcularDesconto,
  formatarMoeda,
  formatarPercentual,
  type ResultadoDesconto,
} from "@/lib/desconto";
import styles from "./page.module.css";

const CASOS_TESTE = [
  { preco: "100", quantidade: "3" },
  { preco: "50", quantidade: "5" },
  { preco: "30", quantidade: "10" },
];

function paraNumero(valor: string): number {
  return Number(valor.trim().replace(",", "."));
}

export default function Home() {
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [resultado, setResultado] = useState<ResultadoDesconto | null>(null);
  const [erro, setErro] = useState("");

  function calcular(precoTexto: string, quantidadeTexto: string) {
    try {
      setResultado(
        calcularDesconto(paraNumero(precoTexto), paraNumero(quantidadeTexto)),
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
        <label className={styles.campo}>
          Preço unitário (R$)
          <input
            type="text"
            inputMode="decimal"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            placeholder="100,00"
          />
        </label>

        <label className={styles.campo}>
          Quantidade comprada
          <input
            type="text"
            inputMode="numeric"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            placeholder="3"
          />
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
