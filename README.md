# Calculadora de Desconto de Produtos

Aplicação web (Next.js + React + TypeScript) que calcula o desconto de uma compra
com base na quantidade de itens. Tema visual verde da Univille.

## Regras de negócio

| Quantidade comprada | Desconto |
| ------------------- | -------- |
| menor que 5         | 5%       |
| de 5 a 9 (inclusive) | 10%     |
| 10 ou mais          | 15%      |

Cálculos:

```
valor_bruto    = preço_unitário × quantidade
valor_desconto = valor_bruto × percentual_desconto
valor_final    = valor_bruto − valor_desconto
```

Validações:

- Preço unitário deve ser um número maior que zero.
- Quantidade deve ser um número inteiro maior que zero.
- Entradas inválidas são rejeitadas com uma mensagem de erro clara na tela.

A lógica fica isolada em [`src/lib/desconto.ts`](src/lib/desconto.ts); a interface
está em [`src/app/page.tsx`](src/app/page.tsx).

## Rodando localmente

```bash
npm install
npm run dev        # http://localhost:3000
```

Outros comandos:

```bash
npm run build      # build de produção
npm test           # testes das regras de negócio (node:test)
npm run lint
```

## Testes

`npm test` executa os 3 casos exigidos e testes extras de faixa e validação:

| Caso | Preço   | Qtd | Desconto | Valor final |
| ---- | ------- | --- | -------- | ----------- |
| 1    | R$ 100,00 | 3  | 5%       | R$ 285,00   |
| 2    | R$ 50,00  | 5  | 10%      | R$ 225,00   |
| 3    | R$ 30,00  | 10 | 15%      | R$ 255,00   |

## Deploy na Vercel

1. Suba o repositório para o GitHub.
2. Em [vercel.com](https://vercel.com), **Add New → Project** e importe o repositório.
3. A Vercel detecta o Next.js automaticamente — nenhuma configuração extra é
   necessária. Clique em **Deploy**.

Não há variáveis de ambiente para configurar.
