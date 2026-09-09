"use client";

/**
 * Botão que alterna entre tema claro e escuro.
 * Guarda a escolha em localStorage; o layout aplica antes de pintar a tela.
 * O texto do botão troca via CSS (regras `.tema-so-*` em globals.css), então
 * não precisamos de estado nem de efeito aqui.
 */
export default function TemaToggle() {
  function alternar() {
    const atual =
      document.documentElement.dataset.tema === "escuro" ? "escuro" : "claro";
    const novo = atual === "escuro" ? "claro" : "escuro";
    document.documentElement.dataset.tema = novo;
    try {
      localStorage.setItem("tema", novo);
    } catch {
      // localStorage pode estar indisponível (aba anônima, etc.)
    }
  }

  return (
    <button
      type="button"
      className="tema-toggle"
      onClick={alternar}
      aria-label="Alternar entre tema claro e escuro"
    >
      <span className="tema-so-claro">☾ Tema escuro</span>
      <span className="tema-so-escuro">☀ Tema claro</span>
    </button>
  );
}
