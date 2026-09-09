# Explicação do código

Documento para acompanhar o código da **Calculadora de Desconto de Produtos**.
Cada título tem um link 📍 que abre o arquivo direto na(s) linha(s) explicada(s).

> Os links de linha funcionam no GitHub. No VS Code, clicar abre o arquivo
> correspondente.

---

## Visão geral

| Item | Descrição |
| --- | --- |
| O que é | Página web que calcula o desconto de uma compra conforme a quantidade |
| Linguagem | TypeScript |
| Framework | Next.js 16 (App Router) + React 19 |
| Estilo | CSS Modules + variáveis de cor (tema Univille) |
| Onde roda | Vercel (deploy automático a cada `git push`) |

### Onde está cada coisa

| Arquivo | Responsabilidade |
| --- | --- |
| [`src/lib/desconto.ts`](src/lib/desconto.ts) | **A lógica**: regra de desconto, validação, cálculo e formatação |
| [`src/app/page.tsx`](src/app/page.tsx) | **A tela**: formulário, tratamento da digitação e exibição do resultado |
| [`src/app/layout.tsx`](src/app/layout.tsx) | Estrutura HTML base, fonte e título da aba |
| [`src/app/globals.css`](src/app/globals.css) | Cores do tema e estilos gerais |
| [`src/app/page.module.css`](src/app/page.module.css) | Estilos só da página da calculadora |
| [`src/lib/desconto.test.ts`](src/lib/desconto.test.ts) | Testes automatizados da lógica |
| [`exemplo-logica.ts`](exemplo-logica.ts) | Versão enxuta e comentada da lógica, para demonstração |

---

## 1. A lógica de negócio — `src/lib/desconto.ts`

Este arquivo **não sabe nada de tela**. São só funções puras (entra número,
sai número), o que deixa a regra fácil de testar e de reaproveitar.

### 1.1 `ResultadoDesconto` (o formato do resultado)

📍 [`src/lib/desconto.ts` L10-L17](src/lib/desconto.ts#L10-L17)

Uma `interface` que descreve o objeto devolvido pelo cálculo: valor bruto,
percentual aplicado (guardado como fração — `0.15` e não `15`), valor do
desconto e valor final. Serve para o TypeScript avisar se a gente esquecer
um campo ou escrever o nome errado.

### 1.2 `obterPercentualDesconto` (a regra das faixas)

📍 [`src/lib/desconto.ts` L19-L24](src/lib/desconto.ts#L19-L24)

```ts
if (quantidade >= 10) return 0.15; // 15%
if (quantidade >= 5)  return 0.1;  // 10%  (5 a 9)
return 0.05;                       //  5%  (menos de 5)
```

A ordem importa: testamos a faixa **maior primeiro**. Se a quantidade é 12,
o primeiro `if` já resolve. Se é 7, o primeiro `if` é falso e o segundo pega.
Se é 2, cai no `return` final.

### 1.3 `calcularDesconto` (validação + conta)

📍 [`src/lib/desconto.ts` L30-L57](src/lib/desconto.ts#L30-L57)

Duas partes:

**Validação** — 📍 [L34-L42](src/lib/desconto.ts#L34-L42)
- preço precisa ser número finito e `> 0` → senão `throw new Error(...)`
- quantidade precisa ser número finito e `> 0`
- quantidade precisa ser **inteira** (`Number.isInteger`) — não existe "2,5 unidades"

Quando algo está errado a função **lança um erro** com a mensagem pronta para
mostrar ao usuário. Quem chamou decide o que fazer com esse erro.

**Cálculo** — 📍 [L44-L47](src/lib/desconto.ts#L44-L47)
```ts
const percentualDesconto = obterPercentualDesconto(quantidade);
const valorBruto    = precoUnitario * quantidade;
const valorDesconto = valorBruto * percentualDesconto;
const valorFinal    = valorBruto - valorDesconto;
```
É exatamente a fórmula do enunciado, uma linha por conta.

### 1.4 `formatarMoeda` e `formatarPercentual`

📍 [`src/lib/desconto.ts` L59-L65](src/lib/desconto.ts#L59-L65) e
📍 [L67-L72](src/lib/desconto.ts#L67-L72)

Usam `toLocaleString("pt-BR", ...)` do próprio JavaScript para transformar
`285` em `R$ 285,00` e `0.15` em `15%`. Não fazemos formatação na mão.

---

## 2. A interface — `src/app/page.tsx`

### 2.1 `"use client"` e imports

📍 [`src/app/page.tsx` L1-L11](src/app/page.tsx#L1-L11)

`"use client"` no topo diz ao Next que este componente roda **no navegador**
(porque usa `useState` e eventos de clique/digitação). Logo abaixo, importamos
as funções da lógica com `@/lib/desconto` (`@/` é atalho para a pasta `src/`).

### 2.2 `Separador` e `CASOS_TESTE`

📍 [`src/app/page.tsx` L13](src/app/page.tsx#L13) e
📍 [L15-L19](src/app/page.tsx#L15-L19)

`type Separador = "," | "."` — só dois valores possíveis; qualquer outra coisa
o TypeScript recusa. `CASOS_TESTE` é a lista usada pelos botões de exemplo no
final da página.

### 2.3 Segurança da digitação — `limparPreco`

📍 [`src/app/page.tsx` L21-L32](src/app/page.tsx#L21-L32)

É o que impede a pessoa de digitar coisa inválida no campo de preço:

1. `valor.replace(new RegExp(\`[^0-9${escapado}]\`, "g"), "")` — apaga tudo que
   **não** for dígito nem o separador escolhido (tira letras, `R$`, espaço...).
2. o bloco seguinte garante **no máximo um** separador: acha o primeiro e
   remove os outros que vierem depois.

O resultado volta limpo para o `onChange` do input (ver 2.9).

### 2.4 `limparQuantidade`

📍 [`src/app/page.tsx` L34-L37](src/app/page.tsx#L34-L37)

`valor.replace(/\D/g, "")` — `\D` é "não-dígito". Sobra só número inteiro.

### 2.5 `paraNumero`

📍 [`src/app/page.tsx` L39-L41](src/app/page.tsx#L39-L41)

Converte o texto do input em número de verdade. Como o JavaScript só entende
ponto, trocamos o separador escolhido por `.` antes do `Number(...)`:
`"1.234,56".split(",").join(".")` → `Number("1.234.56")`... (obs.: aqui não
tratamos separador de milhar — o campo aceita só um separador decimal).

### 2.6 Estados do componente (`useState`)

📍 [`src/app/page.tsx` L43-L48](src/app/page.tsx#L43-L48)

Cada `useState` é um "valor que, quando muda, redesenha a tela":

| Estado | Guarda |
| --- | --- |
| `separador` | `","` ou `"."` (começa em vírgula) |
| `preco` | o texto digitado no campo de preço |
| `quantidade` | o texto digitado no campo de quantidade |
| `resultado` | o objeto `ResultadoDesconto`, ou `null` se ainda não calculou |
| `erro` | a mensagem de erro, ou `""` se está tudo certo |

### 2.7 `trocarSeparador`

📍 [`src/app/page.tsx` L52-L55](src/app/page.tsx#L52-L55)

Ao trocar entre `,` e `.`, também converte o que já estava digitado no preço
(`p.replace(/[.,]/g, novo)`), para o campo não ficar inconsistente.

### 2.8 `calcular` e `aoEnviar`

📍 [`src/app/page.tsx` L57-L70](src/app/page.tsx#L57-L70) e
📍 [L72-L75](src/app/page.tsx#L72-L75)

`calcular` é a ponte entre a tela e a lógica:
- chama `calcularDesconto(...)` dentro de um `try`
- deu certo → guarda em `resultado` e limpa o `erro`
- deu `throw` → limpa o `resultado` e mostra `e.message` no `erro`

`aoEnviar` roda no `submit` do formulário; `evento.preventDefault()` evita a
página recarregar.

### 2.9 O JSX (o que aparece na tela)

| Trecho | Linhas |
| --- | --- |
| Cabeçalho "Univille · Desenvolvimento Web" | 📍 [L79-L81](src/app/page.tsx#L79-L81) |
| Título e lista das regras de desconto | 📍 [L83-L90](src/app/page.tsx#L83-L90) |
| `<form>` (dispara `aoEnviar`) | 📍 [L92](src/app/page.tsx#L92) |
| Opção vírgula / ponto (`<fieldset>` + 2 `radio`) | 📍 [L93-L113](src/app/page.tsx#L93-L113) |
| Campo **Preço** + dica com exemplo do formato | 📍 [L115-L128](src/app/page.tsx#L115-L128) |
| Campo **Quantidade** + dica | 📍 [L130-L142](src/app/page.tsx#L130-L142) |
| Botão **Calcular** | 📍 [L144](src/app/page.tsx#L144) |
| Mensagem de erro (só aparece se `erro` não é vazio) | 📍 [L147](src/app/page.tsx#L147) |
| Tabela com bruto / % / desconto / final | 📍 [L149-L170](src/app/page.tsx#L149-L170) |
| Botões de "Casos de teste" | 📍 [L172-L189](src/app/page.tsx#L172-L189) |

Detalhes que valem citar:
- **`onChange` do preço** (📍 [L121](src/app/page.tsx#L121)):
  `setPreco(limparPreco(e.target.value, separador))` — todo caractere passa
  pelo filtro antes de entrar no estado.
- **`{erro && <p>...}`** e **`{resultado && (<table>...)}`**: em React, isso
  quer dizer "só mostra se existir". Enquanto `resultado` é `null`, a tabela
  nem existe na página.
- **`placeholder={exemploPreco}`** (📍 [L122](src/app/page.tsx#L122)): o exemplo
  do formato (`100,00` ou `100.00`) muda junto com a opção escolhida — valor
  calculado na 📍 [L50](src/app/page.tsx#L50).

---

## 3. Layout e tema

### 3.1 `src/app/layout.tsx`

📍 [`src/app/layout.tsx` L5-L10](src/app/layout.tsx#L5-L10) — carrega a fonte
**Poppins** pelo `next/font` (a mesma pegada do site da Univille).

📍 [L12-L15](src/app/layout.tsx#L12-L15) — `metadata`: título da aba e
descrição.

📍 [L19](src/app/layout.tsx#L19) — `<html lang="pt-BR">`.

### 3.2 `src/app/globals.css`

📍 [`src/app/globals.css` L1-L16](src/app/globals.css#L1-L16) — a paleta em
variáveis CSS:

| Variável | Cor | Uso |
| --- | --- | --- |
| `--verde` / `--verde-escuro` | `#3aaa35` / `#2c8a2a` | textos, linha do cabeçalho, valor final |
| `--lima` / `--lima-escuro` | `#c6d600` / `#b2c000` | botão **Calcular** |
| `--titulo` / `--texto` / `--cinza` | tons de cinza | títulos, corpo, dicas |

### 3.3 `src/app/page.module.css`

📍 [`src/app/page.module.css`](src/app/page.module.css) — cada classe
(`.pagina`, `.formulario`, `.campo`, `.dica`, `.resultado`, `.linhaFinal`...)
é usada com `className={styles.nome}` no `page.tsx`. Por ser *CSS Module*, os
nomes não vazam para outras páginas.

---

## 4. Os testes — `src/lib/desconto.test.ts`

Rodam com `npm test` (usa o `node:test`, embutido no Node — sem biblioteca
extra).

| Teste | Linhas |
| --- | --- |
| Caso 1 — `R$ 100,00 × 3` → `R$ 285,00` | 📍 [L6-L12](src/lib/desconto.test.ts#L6-L12) |
| Caso 2 — `R$ 50,00 × 5` → `R$ 225,00` | 📍 [L14-L20](src/lib/desconto.test.ts#L14-L20) |
| Caso 3 — `R$ 30,00 × 10` → `R$ 255,00` | 📍 [L22-L28](src/lib/desconto.test.ts#L22-L28) |
| Faixas de desconto (4, 5, 9, 10, 100) | 📍 [L30-L36](src/lib/desconto.test.ts#L30-L36) |
| Preço zero/negativo é recusado | 📍 [L38-L41](src/lib/desconto.test.ts#L38-L41) |
| Quantidade zero/negativa/fracionária é recusada | 📍 [L43-L47](src/lib/desconto.test.ts#L43-L47) |
| `formatarMoeda` no padrão brasileiro | 📍 [L49-L53](src/lib/desconto.test.ts#L49-L53) |

---

## 5. Arquivo de exemplo — `exemplo-logica.ts`

📍 [`exemplo-logica.ts`](exemplo-logica.ts)

Versão de uma página só, autocontida e bem comentada, da mesma lógica. Ao
rodar (`npm run exemplo`), imprime no terminal os 3 casos do enunciado com a
conferência do resultado e também exemplos de entradas inválidas sendo
recusadas. Serve para ler/mostrar a regra sem abrir o projeto inteiro.

---

## 6. Como rodar

```bash
npm install        # instala as dependências (primeira vez)

npm run dev        # site em http://localhost:3000
npm run exemplo    # roda o exemplo-logica.ts no terminal
npm test           # roda os testes automatizados
npm run build      # gera a versão de produção (o que a Vercel faz)
```

---

## 7. Resumo do fluxo quando clico em "Calcular"

1. O `<form>` dispara [`aoEnviar`](src/app/page.tsx#L72-L75), que chama
   [`calcular`](src/app/page.tsx#L57-L70).
2. `calcular` usa [`paraNumero`](src/app/page.tsx#L39-L41) para transformar os
   textos dos campos em números (respeitando o separador escolhido).
3. Chama [`calcularDesconto`](src/lib/desconto.ts#L30-L57):
   - se algum número for inválido, ela **lança um erro** → cai no `catch` e a
     [mensagem](src/app/page.tsx#L147) aparece na tela;
   - se estiver tudo certo, ela usa
     [`obterPercentualDesconto`](src/lib/desconto.ts#L19-L24) e faz as
     [contas](src/lib/desconto.ts#L44-L47), devolvendo um `ResultadoDesconto`.
4. O resultado é guardado no estado `resultado`, o React redesenha a tela e a
   [tabela](src/app/page.tsx#L149-L170) aparece com os valores já formatados
   por [`formatarMoeda`](src/lib/desconto.ts#L59-L65) e
   [`formatarPercentual`](src/lib/desconto.ts#L67-L72).
