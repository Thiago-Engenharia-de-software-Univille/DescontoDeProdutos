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
| Estilo | CSS Modules + variáveis de cor (tema Univille), com tema claro/escuro |
| Onde roda | Vercel (deploy automático a cada `git push`) |

### Onde está cada coisa

| Arquivo | Responsabilidade |
| --- | --- |
| [`src/lib/desconto.ts`](src/lib/desconto.ts) | **A lógica**: regra de desconto, validação, cálculo e formatação |
| [`src/app/page.tsx`](src/app/page.tsx) | **A tela da calculadora**: formulário, digitação e exibição do resultado |
| [`src/app/como-e-feito/page.tsx`](src/app/como-e-feito/page.tsx) | **2ª página**: o mesmo código em JavaScript, TypeScript e React |
| [`src/app/TemaToggle.tsx`](src/app/TemaToggle.tsx) | Botão de alternar tema claro/escuro |
| [`src/app/layout.tsx`](src/app/layout.tsx) | Estrutura HTML base, fonte, título da aba e aplicação do tema salvo |
| [`src/app/globals.css`](src/app/globals.css) | Cores dos dois temas e estilos gerais |
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

## 2. A tela da calculadora — `src/app/page.tsx`

### 2.1 `"use client"` e imports

📍 [`src/app/page.tsx` L1-L13](src/app/page.tsx#L1-L13)

`"use client"` no topo diz ao Next que este componente roda **no navegador**
(porque usa `useState` e eventos de clique/digitação). Logo abaixo, importamos
as funções da lógica com `@/lib/desconto` (`@/` é atalho para a pasta `src/`),
o `Link` do Next e o botão de tema.

### 2.2 `Separador` e `CASOS_TESTE`

📍 [`src/app/page.tsx` L15](src/app/page.tsx#L15) e
📍 [L17-L21](src/app/page.tsx#L17-L21)

`type Separador = "," | "."` — só dois valores possíveis; qualquer outra coisa
o TypeScript recusa. `CASOS_TESTE` é a lista usada pelos botões de exemplo no
final da página.

### 2.3 Segurança da digitação — `limparPreco`

📍 [`src/app/page.tsx` L23-L34](src/app/page.tsx#L23-L34)

É o que impede a pessoa de digitar coisa inválida no campo de preço:

1. `valor.replace(new RegExp("[^0-9" + escapado + "]", "g"), "")` — apaga tudo
   que **não** for dígito nem o separador escolhido (tira letras, `R$`, espaço...).
2. o bloco seguinte garante **no máximo um** separador: acha o primeiro e
   remove os outros que vierem depois.

O resultado volta limpo para o `onChange` do input (ver 2.9).

### 2.4 `limparQuantidade`

📍 [`src/app/page.tsx` L36-L39](src/app/page.tsx#L36-L39)

`valor.replace(/\D/g, "")` — `\D` é "não-dígito". Sobra só número inteiro.

### 2.5 `paraNumero`

📍 [`src/app/page.tsx` L41-L43](src/app/page.tsx#L41-L43)

Converte o texto do input em número de verdade. Como o JavaScript só entende
ponto, trocamos o separador escolhido por `.` antes do `Number(...)`.

### 2.6 Estados do componente (`useState`)

📍 [`src/app/page.tsx` L45-L50](src/app/page.tsx#L45-L50)

Cada `useState` é um "valor que, quando muda, redesenha a tela":

| Estado | Guarda |
| --- | --- |
| `separador` | `","` ou `"."` (começa em vírgula) |
| `preco` | o texto digitado no campo de preço |
| `quantidade` | o texto digitado no campo de quantidade |
| `resultado` | o objeto `ResultadoDesconto`, ou `null` se ainda não calculou |
| `erro` | a mensagem de erro, ou `""` se está tudo certo |

### 2.7 `trocarSeparador`

📍 [`src/app/page.tsx` L54-L57](src/app/page.tsx#L54-L57)

Ao trocar entre `,` e `.`, também converte o que já estava digitado no preço
(`p.replace(/[.,]/g, novo)`), para o campo não ficar inconsistente.

### 2.8 `calcular` e `aoEnviar`

📍 [`src/app/page.tsx` L59-L72](src/app/page.tsx#L59-L72) e
📍 [L74-L77](src/app/page.tsx#L74-L77)

`calcular` é a ponte entre a tela e a lógica:
- chama `calcularDesconto(...)` dentro de um `try`
- deu certo → guarda em `resultado` e limpa o `erro`
- deu `throw` → limpa o `resultado` e mostra `e.message` no `erro`

`aoEnviar` roda no `submit` do formulário; `evento.preventDefault()` evita a
página recarregar.

### 2.9 O JSX (o que aparece na tela)

| Trecho | Linhas |
| --- | --- |
| Barra do topo: link para a 2ª página + botão de tema | 📍 [L81-L86](src/app/page.tsx#L81-L86) |
| Cabeçalho "Univille · Desenvolvimento Web" | 📍 [L88-L90](src/app/page.tsx#L88-L90) |
| Título e lista das regras de desconto | 📍 [L92-L99](src/app/page.tsx#L92-L99) |
| `<form>` (dispara `aoEnviar`) | 📍 [L101](src/app/page.tsx#L101) |
| Opção vírgula / ponto (`<fieldset>` + 2 `radio`) | 📍 [L102-L122](src/app/page.tsx#L102-L122) |
| Campo **Preço** + dica com exemplo do formato | 📍 [L124-L137](src/app/page.tsx#L124-L137) |
| Campo **Quantidade** + dica | 📍 [L139-L151](src/app/page.tsx#L139-L151) |
| Botão **Calcular** | 📍 [L153](src/app/page.tsx#L153) |
| Mensagem de erro (só aparece se `erro` não é vazio) | 📍 [L156](src/app/page.tsx#L156) |
| Tabela com bruto / % / desconto / final | 📍 [L158-L179](src/app/page.tsx#L158-L179) |
| Botões de "Casos de teste" | 📍 [L181-L198](src/app/page.tsx#L181-L198) |

Detalhes que valem citar:
- **`onChange` do preço** (📍 [L130](src/app/page.tsx#L130)):
  `setPreco(limparPreco(e.target.value, separador))` — todo caractere passa
  pelo filtro antes de entrar no estado.
- **`{erro && <p>...}`** e **`{resultado && (<table>...)}`**: em React, isso
  quer dizer "só mostra se existir". Enquanto `resultado` é `null`, a tabela
  nem existe na página.
- **`placeholder={exemploPreco}`** (📍 [L131](src/app/page.tsx#L131)): o exemplo
  do formato (`100,00` ou `100.00`) muda junto com a opção escolhida — valor
  calculado na 📍 [L52](src/app/page.tsx#L52).

---

## 3. Tema claro/escuro

### 3.1 O botão — `src/app/TemaToggle.tsx`

📍 [`src/app/TemaToggle.tsx`](src/app/TemaToggle.tsx)

Ao clicar, ele lê o tema atual em `document.documentElement.dataset.tema`,
inverte, grava o novo valor de volta nesse atributo e salva em
`localStorage`. O **texto** do botão (☾ / ☀) troca só por CSS, então não
precisa de `useState` aqui.

### 3.2 Aplicar o tema salvo — `src/app/layout.tsx`

📍 [`src/app/layout.tsx` L17-L18](src/app/layout.tsx#L17-L18) e
📍 [L23-L25](src/app/layout.tsx#L23-L25)

Um `<script>` pequeno roda **antes da página pintar**: lê o `localStorage` e
já põe `data-tema="escuro"` no `<html>` se for o caso. Sem isso, a tela
"piscaria" do claro para o escuro ao carregar.

### 3.3 As cores — `src/app/globals.css`

📍 [`src/app/globals.css` L1-L18](src/app/globals.css#L1-L18) — tema **claro**
(padrão), e 📍 [L20-L37](src/app/globals.css#L20-L37) — tema **escuro**
(`:root[data-tema="escuro"]`).

Tudo são variáveis CSS; a folha de estilo usa `var(--verde)`, `var(--fundo)`
etc. e o tema só troca o valor delas.

| Variável | Uso |
| --- | --- |
| `--verde` / `--verde-escuro` | textos, linha do cabeçalho, valor final |
| `--lima` / `--lima-escuro` | botão **Calcular** |
| `--fundo` / `--fundo-secao` / `--borda` | fundos e bordas |
| `--titulo` / `--texto` / `--cinza` | títulos, corpo, dicas |

### 3.4 Fonte e título — `src/app/layout.tsx`

📍 [`src/app/layout.tsx` L5-L10](src/app/layout.tsx#L5-L10) — carrega a fonte
**Poppins** pelo `next/font` (a mesma pegada do site da Univille).
📍 [L12-L15](src/app/layout.tsx#L12-L15) — `metadata` (título da aba).

---

## 4. Segunda página — `src/app/como-e-feito/page.tsx`

📍 [`src/app/como-e-feito/page.tsx`](src/app/como-e-feito/page.tsx)

Mostra a **mesma calculadora escrita de 3 formas**. Como está na pasta
`como-e-feito/`, o endereço dela é `/como-e-feito`.

- 📍 [botões das abas JavaScript / TypeScript / React](src/app/como-e-feito/page.tsx#L307-L320)
  — um `useState<Aba>` (📍 [L284](src/app/como-e-feito/page.tsx#L284)) guarda qual
  está selecionada.
- 📍 [HTML e CSS de exemplo](src/app/como-e-feito/page.tsx#L324-L338) — só aparecem
  nas abas JavaScript e TypeScript. Os textos ficam nas constantes
  [`HTML_EXEMPLO`](src/app/como-e-feito/page.tsx#L11-L38) e
  [`CSS_EXEMPLO`](src/app/como-e-feito/page.tsx#L40-L72).
- 📍 [código da lógica em JS / TS / React](src/app/como-e-feito/page.tsx#L340-L356)
  — o `<pre>` mostra [`JS_EXEMPLO`](src/app/como-e-feito/page.tsx#L74-L123),
  [`TS_EXEMPLO`](src/app/como-e-feito/page.tsx#L125-L187) ou
  [`REACT_EXEMPLO`](src/app/como-e-feito/page.tsx#L189-L274) conforme a aba.
- O link **← Voltar para a calculadora** e o botão de tema ficam na barra do
  topo, igual à página principal.

Estilo dessa página: [`src/app/como-e-feito/codigo.module.css`](src/app/como-e-feito/codigo.module.css).

---

## 5. Os testes — `src/lib/desconto.test.ts`

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

## 6. Arquivo de exemplo — `exemplo-logica.ts`

📍 [`exemplo-logica.ts`](exemplo-logica.ts)

Versão de uma página só, autocontida e bem comentada, da mesma lógica. Ao
rodar (`npm run exemplo`), imprime no terminal os 3 casos do enunciado com a
conferência do resultado e também exemplos de entradas inválidas sendo
recusadas. Serve para ler/mostrar a regra sem abrir o projeto inteiro.

---

## 7. Como rodar

```bash
npm install        # instala as dependências (primeira vez)

npm run dev        # site em http://localhost:3000
npm run exemplo    # roda o exemplo-logica.ts no terminal
npm test           # roda os testes automatizados
npm run build      # gera a versão de produção (o que a Vercel faz)
```

---

## 8. Resumo do fluxo quando clico em "Calcular"

1. O `<form>` dispara [`aoEnviar`](src/app/page.tsx#L74-L77), que chama
   [`calcular`](src/app/page.tsx#L59-L72).
2. `calcular` usa [`paraNumero`](src/app/page.tsx#L41-L43) para transformar os
   textos dos campos em números (respeitando o separador escolhido).
3. Chama [`calcularDesconto`](src/lib/desconto.ts#L30-L57):
   - se algum número for inválido, ela **lança um erro** → cai no `catch` e a
     [mensagem](src/app/page.tsx#L156) aparece na tela;
   - se estiver tudo certo, ela usa
     [`obterPercentualDesconto`](src/lib/desconto.ts#L19-L24) e faz as
     [contas](src/lib/desconto.ts#L44-L47), devolvendo um `ResultadoDesconto`.
4. O resultado é guardado no estado `resultado`, o React redesenha a tela e a
   [tabela](src/app/page.tsx#L158-L179) aparece com os valores já formatados
   por [`formatarMoeda`](src/lib/desconto.ts#L59-L65) e
   [`formatarPercentual`](src/lib/desconto.ts#L67-L72).
