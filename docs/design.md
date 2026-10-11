# design.md: Design system do Hubbi

| Campo | Valor |
|-------|-------|
| Versão | 1.0 (2026-10-10) |
| Fonte no código | [`src/styles/tokens.css`](../src/styles/tokens.css), [`landing.css`](../src/styles/landing.css), [`auth.css`](../src/styles/auth.css), [`src/components/`](../src/components) |
| Referência visual | Linguagem da AbacatePay (pílulas, títulos pesados, moldura arredondada, seção escura), com a paleta da marca Hubbi |
| Documentos irmãos | [PRD](PRD.md) · [TRD](TRD.md) · [Contrato de design da spec](specs/001-fluxos-reservas-hubbi/contracts/design-system.md) |

Este arquivo descreve o design system **como está no código** e o que falta para as telas do
portal (PRD, seção 5.2). Componentes marcados **Proposta** ainda não existem e precisam de
aprovação antes de construir.

## 1. Princípios

1. **Preço sempre à vista.** Valor cheio, desconto e valor final aparecem antes de qualquer
   confirmação. Multa e estorno aparecem antes de cancelar (Constituição IV, SC-005).
2. **Estado nunca só por cor.** Todo estado tem texto e ícone, além da cor.
3. **Um destaque por tela.** Uma ação principal em azul; as outras são secundárias.
4. **Português claro.** Frases curtas, verbos de ação nos botões, sem jargão de sistema.
5. **Movimento responde à pessoa.** Animação só para orientar uma entrada ou confirmar uma
   ação, e nenhuma para quem pede menos movimento.

## 2. Marca

- **Símbolo:** três pessoas ao redor de uma mesa triangular. Pessoas em Roxo Hubbi `#38265F` (ou
  claras sobre fundo escuro) e mesa em Pervinca `#91A3DC`. Componente
  [`Mark`](../src/components/Mark.tsx), desenhado em código a partir da imagem da marca.
- **Wordmark:** "Hubbi" em Nunito 900, espaçamento −0,03em, ao lado do símbolo
  ([`Logo`](../src/components/Logo.tsx)).
- **Tamanho mínimo:** símbolo com 20 px (contrato da spec).
- **Movimento da marca:** o símbolo gira 120° ao carregar e ao passar o mouse, como se as três
  pessoas trocassem de lugar à mesa.
- **Proibido:** Pervinca como cor de texto sobre fundo claro (contraste 2,31:1) e recolorir o
  símbolo fora da paleta.

## 3. Cores

### 3.1 Tokens

| Token | Hex | Uso |
|-------|-----|-----|
| `--ink` | `#1E1D2B` | Títulos e texto principal |
| `--ink-soft` | `#4A4860` | Texto de apoio |
| `--primary` | `#4A56C8` | Ação principal, links, destaque de título, foco |
| `--primary-press` | `#3A45AE` | Botão principal pressionado ou com o mouse em cima |
| `--sky` | `#E5E7FA` | Seleção, item ativo, fundos de destaque |
| `--lilac` | `#E3D9F6` | Etiquetas e bordas suaves |
| `--lilac-deep` | `#654AA6` | Texto sobre lilás, rótulos de grupo |
| `--paper` | `#F7F6FC` | Fundo de áreas e cartões internos |
| `--white` | `#FFFFFF` | Fundo da página, cartões e campos |
| `--plum` | `#38265F` | Marca; seções escuras, painéis laterais e rodapé |
| `--peri` | `#91A3DC` | Marca; destaque sobre roxo e seleção sobre roxo |
| `--line` | `#E4E1F0` | Bordas de cartões e divisórias |
| `--field` | `#807C98` | Borda de campo de formulário |

### 3.2 Cores semânticas

Estão **em uso, mas ainda "a aprovar"** na [pesquisa da spec](specs/001-fluxos-reservas-hubbi/research.md)
(R2). Ver pendência 1.

| Papel | Fundo | Texto e ícone | Uso |
|-------|-------|---------------|-----|
| Sucesso | `--ok-bg #E3F4EA` | `--ok #17633A` | Confirmada, livre, pontos ganhos, regra cumprida |
| Alerta | `--warn-bg #FDF1D8` | `--warn #7A4B00` | Aguardando pagamento, prazo perto, Caps Lock |
| Erro | `--err-bg #FBE3E3` | `--err #A12626` | Erros de campo, login inválido, cancelada, multa |
| Informação | `--sky` | `--primary` | Avisos neutros |
| Neutro | `#ECEBF3` | `--ink-soft` | Concluída, inativo |

### 3.3 Contrastes verificados

Calculados pela fórmula de luminância do WCAG 2.2. Mínimo AA: 4,5:1 para texto, 3:1 para texto
grande e controles.

| Combinação | Razão | Uso permitido |
|------------|------:|---------------|
| Branco sobre `--primary` | 6,08 | Botão principal |
| `--primary` sobre `--paper` | 5,65 | Links e destaques |
| `--ink` sobre branco | 16,59 | Texto principal |
| `--ink-soft` sobre branco | 8,80 | Texto de apoio |
| `--lilac-deep` sobre `--lilac` | 5,03 | Etiquetas |
| `--field` sobre branco | 4,00 | Borda de campo (mínimo 3:1) |
| `--paper` sobre `--plum` | 12,13 | Títulos sobre roxo |
| `#D7D1EA` sobre `--plum` | 8,81 | Texto de apoio sobre roxo |
| `--peri` sobre `--plum` | 5,26 | Destaque de título sobre roxo |
| `--ink` sobre `--peri` | 6,70 | Opção selecionada sobre roxo |
| Sucesso, alerta, erro (texto sobre o próprio fundo) | 6,38 · 6,62 · 6,10 | Selos e avisos |
| `--primary` sobre `--sky` | 4,96 | Item ativo |
| `--peri` sobre `--paper` | **2,31** | Só decoração: nunca texto nem borda de controle |

## 4. Tipografia

| Família | Papel | Pesos |
|---------|-------|-------|
| Nunito | Títulos, números grandes, wordmark | 700, 800, 900 |
| Inter | Corpo, formulários, tabelas, botões | 400, 500, 600 |
| Caveat | Uma anotação manuscrita por tela, decorativa (`aria-hidden`) | 600 |

Nunito e Inter seguem a proposta do contrato da spec; a fonte oficial da marca ainda não foi
informada (pendência 2).

### 4.1 Escala

| Estilo | Tamanho | Linha | Peso e espaçamento | Onde |
|--------|---------|-------|--------------------|------|
| Título de página (landing) | 40 a 74 px, fluido | 1,02 | Nunito 900, −0,045em | Hero |
| Título de seção (landing) | 32 a 52 px, fluido | 1,05 | Nunito 900, −0,04em | Seções |
| Título de tela (acesso e portal) | 34 a 58 px, fluido | 1,05 | Nunito 900, −0,045em | Login, cadastro, portal |
| Título de cartão | 18 a 22 px | 1,2 | Nunito 800, −0,02em | Cartões |
| Corpo grande | 17 a 20 px | 1,6 | Inter 400 | Texto de abertura |
| Corpo | 16 a 17 px | 1,55 | Inter 400 | Texto padrão |
| Rótulo | 15 a 16 px | 1,4 | Inter 600 | Rótulos de campo |
| Apoio | 13 a 14 px | 1,4 | Inter 400 ou 500 | Dicas, metadados |
| Número de destaque | 26 a 96 px | 1 | Nunito 900, algarismos tabulares | Preços, pontos, descontos |

### 4.2 Regras

- Títulos em duas partes: a primeira frase em `--ink` e a segunda, completa, em `--primary`
  (classe `.tone`). Nunca destacar uma palavra solta.
- Valores em reais e horários usam `font-variant-numeric: tabular-nums`.
- Linhas de texto com até cerca de 65 caracteres.
- Sem texto todo em maiúsculas.

## 5. Espaço, forma e grade

| Item | Valores |
|------|---------|
| Espaçamento | 4, 8, 12, 16, 24, 32, 48, 64 px |
| Raio | 999 px (pílulas, botões, etiquetas) · 40 px (molduras e seções) · 24 px (cartões) · 14 px (campos) · 12 px (itens pequenos) |
| Sombra 1 | `--shadow-1`: cartões em repouso |
| Sombra 2 | `--shadow-2`: demonstração do produto, menus suspensos |
| Largura de conteúdo | `--wrap` 1180 px (1320 px acima de 1600 px) |
| Margem lateral mínima | 16 px (12 px abaixo de 560 px) |
| Alvo de toque | Mínimo 44 × 44 px |

### 5.1 Pontos de quebra

| Largura | Mudança |
|---------|---------|
| até 560 px | Celular: uma coluna, botões de topo menores, margem de 12 px |
| até 820 px | Seções em duas colunas viram uma; simulador em uma coluna |
| até 960 px | Telas de acesso: painel roxo some, formulário até 560 px |
| até 1020 px | Landing: links do topo viram botão de menu |
| 961 a 1279 px | Telas de acesso: painel roxo mais estreito, formulário 520 px |
| a partir de 1280 px | Formulário 540 a 580 px, campos e botões de 58 px |
| a partir de 1600 px | Conteúdo mais largo; formulário 600 a 640 px |
| Portal: até 1023 px | Barra superior e barra inferior com 4 itens; conteúdo na largura da tela |
| Portal: 1024 a 1279 px | Menu lateral de 248 px; conteúdo em uma coluna, cartões laterais em duas |
| Portal: 1280 a 1699 px | Menu lateral de 248 px; conteúdo em duas colunas, até 1240 px, alinhado à esquerda ao lado do menu |
| Portal: a partir de 1700 px | Menu lateral de 264 px; conteúdo até 1400 px |

O menu lateral sempre encosta na margem da página (`--gutter`: 16 px, 12 px abaixo de 560 px).
O conteúdo começa sempre na mesma margem ao lado do menu, **alinhado à esquerda, nunca
centralizado**; só a largura máxima limita o lado direito. Telas com pouco conteúdo usam duas
colunas no computador em vez de uma coluna estreita. Regras completas e verificação no
[CLAUDE.md](../CLAUDE.md).

## 6. Movimento

| Token | Valor | Uso |
|-------|-------|-----|
| `--ease-out` | `cubic-bezier(.2, .75, .2, 1)` | Entradas e saídas |
| `--ease-spring` | `cubic-bezier(.34, 1.45, .55, 1)` | Giro do símbolo, confirmações |
| Rápido | 150 a 200 ms | Botões, campos, menus |
| Médio | 300 a 450 ms | Troca de tela, contagem de valores |
| Lento | 600 a 1000 ms | Sequência de entrada da página |

| Animação | Quando |
|----------|--------|
| `rise`, `rise-big` | Entrada da página, em sequência (`--i` define a ordem) |
| `rv`, `rv-scale` | Revelação ao rolar, ligada à rolagem; sem suporte, o conteúdo aparece parado |
| `spin-once` | Giro do símbolo ao carregar |
| `shake` | Formulário com erro |
| `fade-in` | Avisos, trocas de tela, menu |
| `pop`, `pop-in` | Itens que entram (cartões filtrados, regra cumprida, ícone de sucesso) |
| `flash` + contagem | Valor que mudou (total do simulador, saldo de pontos) |

Com `prefers-reduced-motion: reduce`, todas as animações e transições são desligadas
(`tokens.css`).

## 7. Componentes

### 7.1 Prontos

| Componente | Variantes e estados | Arquivo |
|------------|---------------------|---------|
| Botão | Principal, secundário (`btn-soft`), fantasma (`btn-ghost`), grande; com mouse em cima, pressionado, carregando (`aria-busy` e indicador), desabilitado | `landing.css`, `auth.css` |
| Logo e símbolo | Com link, sem link, claro sobre roxo | `Logo.tsx`, `Mark.tsx` |
| Campo de texto | Padrão, foco, erro, somente leitura; rótulo, ajuda e erro ligados por `aria-describedby` | `features/auth/fields.tsx` |
| Campo de senha | Mostrar e ocultar, aviso de Caps Lock, área para regras | `features/auth/fields.tsx` |
| Regras da senha | Pendente ou cumprida, com texto para leitor de tela | `pages/Cadastro.tsx` |
| Caixa de seleção | Padrão, marcada, erro | `auth.css` |
| Aviso em linha | Erro com título, texto, lista de links ou ações | `auth.css` |
| Atalho de necessidade (chip) | Padrão, selecionado (`aria-pressed`), dica pulsante | `NeedDemo.tsx` |
| Cartão de espaço | Nome, tipo, etiquetas, selo "Livre", preço do usuário com cheio riscado, ação | `NeedDemo.tsx` |
| Recibo de preço | Total com contagem, linhas de valor, notas de multa e pontos | `Simulator.tsx` |
| Seletor de quantidade | Menos e mais, limites desabilitados | `Simulator.tsx` |
| Opções em pílula (rádio) | Padrão, marcada, foco | `Simulator.tsx` |
| Interruptor | Desligado, ligado (`role="switch"`) | `Simulator.tsx` |
| Pergunta frequente (acordeão) | Fechada, aberta com animação de altura | `Faq.tsx` |
| Menu móvel | Fechado, aberto; fecha com Esc e ao clicar | `Hero.tsx` |
| Painel lateral da marca | Título, lista de benefícios, cartão de rodapé | `pages/Login.tsx`, `pages/Cadastro.tsx` |
| Barra "Estados do protótipo" | Estados de tela e ações simuladas; some com `VITE_SHOW_PROTO=false` | `ProtoBar.tsx` |

### 7.2 Para as telas do portal (Proposta)

Já construídos com a tela inicial (T45): **estrutura do portal**, **selo de estado da reserva**,
**estado vazio** e **carregando** ([`PortalLayout.tsx`](../src/features/portal/PortalLayout.tsx),
[`StatusBadge.tsx`](../src/components/StatusBadge.tsx), [`portal.css`](../src/styles/portal.css)).

| Componente | Para que serve | Requisitos |
|------------|----------------|------------|
| Estrutura do portal (pronto) | Navegação da área logada (Início, Espaços, Minhas reservas, Meu plano, Hubbi Verde, Sair) | Menu lateral no computador; barra inferior com 4 itens no celular; item ativo com `aria-current` |
| Selo de estado da reserva | Mostrar o estado em listas e detalhes | Usar a tabela 7.3: sempre texto e ícone |
| Abas (pronto, T11) | Próximas, Passadas e Canceladas em Minhas reservas | `role="tablist"`, setas do teclado, contagem em cada aba |
| Seletor de data e horário (pronto, T04) | Escolher dia, início e duração | Só horários dentro do funcionamento e em passos de 30 min (RN04, RN05); antecedência mínima de 1 h (RN12) |
| Diálogo de confirmação (pronto, T18 e T28; componente `Dialog`) | Cancelar reserva, pedir e cancelar plano | Mostra multa, retido e estorno antes do botão; o botão diz a ação e o valor; foco preso no diálogo; fecha com Esc |
| Linha do tempo (pronto, T12) | Histórico da reserva | Cada mudança com data, hora e responsável (RN09) |
| Estado vazio | Listas sem itens | O que é, por que está vazio e como começar |
| Carregando | Espera acima de 400 ms | Esqueleto com o formato do conteúdo |
| Aviso rápido (pronto, T12) | Confirmar ação concluída ("Reserva cancelada") | Some sozinho, anunciado por `aria-live` |

### 7.3 Estados da reserva

Rótulos do [data-model](specs/001-fluxos-reservas-hubbi/data-model.md), seção 2.

| Estado | Rótulo | Cor | Ícone |
|--------|--------|-----|-------|
| Pendente | Aguardando pagamento | Alerta | Relógio |
| Confirmada | Confirmada | Sucesso | Visto |
| Concluída | Concluída | Neutro | Visto duplo |
| Cancelada | Cancelada | Erro | Fechar |
| No-show | Não compareceu | Erro em tom neutro | Alerta |

## 8. Padrões

### 8.1 Formulários

- Rótulo visível acima do campo; nunca só o texto de exemplo.
- Validação ao sair do campo e ao enviar. Depois do primeiro erro, o campo revalida enquanto a
  pessoa digita.
- Ao enviar com erros: resumo no topo com links para cada campo, foco no resumo e erro junto de
  cada campo (ui-messages, seção 8).
- Máscaras para CPF, CNPJ e telefone; o teclado numérico abre no celular.
- Botão de envio diz a ação ("Criar minha conta", "Entrar") e mostra o andamento ("Entrando…").

### 8.2 Estados de tela

Toda tela prevê os estados do inventário: padrão (P), carregando (C), vazio (V), erro (E) e
sucesso (S). A barra de protótipo permite mostrar cada um.

### 8.3 Layouts

| Layout | Telas | Estrutura |
|--------|-------|-----------|
| Vitrine | Landing, Nosso impacto | Moldura arredondada no topo, seções alternadas, uma seção Roxo Hubbi, rodapé roxo |
| Acesso | Cadastro, login, recuperar senha | Formulário à esquerda, painel roxo com benefícios à direita; só formulário abaixo de 960 px |
| Portal (Proposta) | T45, T04, T07, T08, T11, T12, T28, T46 | Estrutura do portal (7.2) e conteúdo em largura confortável |

## 9. Acessibilidade

Checklist para cada tela nova:

- [ ] Contraste AA conforme a seção 3.3.
- [ ] Foco visível em todo controle (anel de 3 px em `--primary`).
- [ ] Tudo funciona pelo teclado, na ordem visual.
- [ ] Alvos de toque com pelo menos 44 × 44 px.
- [ ] Estados com texto e ícone, nunca só cor.
- [ ] Campos com rótulo; ajuda e erro ligados por `aria-describedby`; `aria-invalid` no erro.
- [ ] Mudanças importantes anunciadas com `aria-live` (contagens, totais, avisos).
- [ ] Ícones decorativos com `aria-hidden`; botões só com ícone têm `aria-label`.
- [ ] Um `h1` por tela; títulos em ordem.
- [ ] Movimento desligado com `prefers-reduced-motion`.
- [ ] Sem rolagem horizontal de 360 a 1920 px.

## 10. Voz e textos

- Português do Brasil, frases curtas, voz ativa, tom próximo e direto.
- Botões começam com verbo e dizem o resultado: "Reservar este espaço", "Criar minha conta".
- A mesma ação tem o mesmo nome no fluxo inteiro: o botão "Cancelar reserva" gera o aviso
  "Reserva cancelada".
- Erros dizem o que houve e como resolver, sem pedir desculpas: "Confira o e-mail. Ele precisa
  ter @ e domínio, como nome@email.com."
- Mensagens de acesso nunca revelam se uma conta existe (MSG-02, recuperação de senha).
- Dados de exemplo sempre identificados como exemplo.
- Textos oficiais de cada mensagem: [ui-messages](specs/001-fluxos-reservas-hubbi/contracts/ui-messages.md).

## 11. Pendências

| # | Pendência |
|---|-----------|
| 1 | Aprovar as cores semânticas (seção 3.2), hoje "a aprovar" na pesquisa da spec |
| 2 | Fonte oficial da marca, se existir; hoje Nunito e Inter |
| 3 | Logo oficial em vetor para substituir o desenho em código |
| 4 | Aprovar os componentes restantes da seção 7.2 (abas, seletor de data, diálogo, linha do tempo, aviso rápido) |
