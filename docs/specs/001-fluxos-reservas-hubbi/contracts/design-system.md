# Contrato: Design System do Hubbi

Tokens, tipografia e componentes que o agente de design deve criar **antes** das telas (Onda 0).
Nomes de token são sugestões estáveis; manter os mesmos nomes na biblioteca da ferramenta.

## 1. Marca

- **Símbolo**: três pessoas (cabeça e ombros, vistas de cima) sentadas ao redor de uma mesa
  triangular. Pessoas em Roxo Hubbi `#38265F`; mesa em Pervinca `#91A3DC`. Conceito: "Três pessoas,
  uma mesa, um ponto de encontro".
- **Wordmark**: "Hubbi" em sans arredondada, Roxo Hubbi, abaixo ou ao lado do símbolo.
- **Versões a entregar**: principal (vertical), horizontal (símbolo + wordmark), apenas símbolo,
  monocromática, ícone de app (símbolo claro sobre fundo Roxo Hubbi).
- **Tamanhos validados pela marca**: símbolo em 56, 32 e 20 px. Abaixo de 20 px não usar.
- **Uso em interface**: logo no topo do menu lateral (computador e tablet) e no topo do portal
  (celular). Respiro mínimo ao redor igual à altura da cabeça de uma das pessoas.
- **Proibido**: recolorir o símbolo com cores fora da marca; usar a Pervinca como texto.

## 2. Cores

### Base da interface (recebida: "Opção C Pervinca")
| Token | Hex | Uso |
|-------|-----|-----|
| `color.primary` | `#4A56C8` | Botões, links, item ativo, anel de foco |
| `color.primary-soft` | `#E5E7FA` | Menu ativo, seleção, fundos de destaque |
| `color.lilac-soft` | `#E3D9F6` | Etiquetas, ilustrações, detalhes |
| `color.lilac-deep` | `#654AA6` | Texto e ícones sobre lilás |
| `color.background` | `#F7F6FC` | Base das telas |
| `color.text` | `#1E1D2B` | Títulos e corpo |
| `color.surface` | `#FFFFFF` | Cartões, painéis, campos |

### Marca (somente logo e ilustração)
| Token | Hex |
|-------|-----|
| `brand.purple` | `#38265F` |
| `brand.periwinkle` | `#91A3DC` |

### Semânticas (propostas, a aprovar; ver [research.md](../research.md) R2)
| Papel | Fundo | Texto e ícone |
|-------|-------|---------------|
| `success` | `#E3F4EA` | `#17633A` |
| `warning` | `#FDF1D8` | `#7A4B00` |
| `danger` | `#FBE3E3` | `#A12626` |
| `neutral` | `#ECEBF3` | `#4A4860` |
| `info` | `#E5E7FA` | `#4A56C8` |

**Regras**: contraste mínimo 4,5:1 para texto e 3:1 para controles; estado nunca só por cor;
modo escuro fora da v1.

## 3. Tipografia

Proposta (a confirmar): **Nunito** para títulos e wordmark; **Inter** para corpo, tabelas e campos.

| Estilo | Tamanho / altura de linha | Peso | Uso |
|--------|---------------------------|------|-----|
| Display | 32 / 40 | Nunito 800 | Títulos de página no computador |
| Título 1 | 24 / 32 | Nunito 700 | Títulos de seção; telas no celular |
| Título 2 | 20 / 28 | Nunito 700 | Cartões e painéis |
| Corpo grande | 16 / 24 | Inter 400 | Texto destacado e campos |
| Corpo | 14 / 20 | Inter 400 | Texto padrão |
| Corpo forte | 14 / 20 | Inter 600 | Valores, rótulos |
| Legenda | 12 / 16 | Inter 500 | Etiquetas, dicas, tabelas densas |
| Valor financeiro | 24 / 32 | Inter 700, números tabulares | Totais, multa, estorno |

## 4. Espaçamento, forma e elevação

- **Escala de espaçamento**: 4, 8, 12, 16, 24, 32, 48 px.
- **Raio**: 8 px (campos, botões), 16 px (cartões), 999 px (etiquetas e chips).
- **Elevação**: nível 0 (plano), nível 1 (cartão: sombra suave), nível 2 (painéis e menus).
- **Grid**: 12 colunas no computador (1440 px, margem 32), 8 no tablet (768 px, margem 24),
  4 no celular (390 px, margem 16); calha de 24, 16 e 16 px.
- **Alvos de toque**: mínimo 44 × 44 px.

## 5. Componentes e estados

Criar todas as variantes e estados. Estados universais: **padrão, hover, foco, pressionado,
desabilitado, carregando, erro**.

| Componente | Variantes | Observações |
|------------|-----------|-------------|
| Botão | Primário, secundário, texto (link), destrutivo; tamanhos M e G; com ícone | Primário: branco sobre `color.primary`; destrutivo usa `danger` |
| Campo de texto | Padrão, com ícone, com dica, com erro | Rótulo sempre visível; erro em texto abaixo do campo |
| Campo de senha | Com mostrar e ocultar | — |
| Seletor (select) | Simples, múltiplo | — |
| Seletor de data | Dia, intervalo | Desabilita dias sem funcionamento |
| Seletor de horário | Grade de blocos de 30 min | Estados: livre, ocupado, fora do horário, selecionado |
| Seletor de duração | Passos de 30 min entre mínimo e máximo | Mostra os limites |
| Etiqueta de tipo | Sala de reunião, mesa, estação | Fundo `lilac-soft`, texto `lilac-deep` (como no exemplo da marca) |
| Selo de estado | Reserva: Aguardando pagamento, Confirmada, Concluída, Cancelada, Não compareceu; Pagamento: Pendente, Realizado, Estornado; Assinatura: Solicitada, Ativa, Vencida, Cancelada | Rótulo + ícone + cor |
| Cartão de espaço | Lista, grade, selecionado, indisponível | Ver seção 6 |
| Cartão de reserva | Compacto, detalhado | Mostra estado, período, valor final |
| Linha de preço | Cheio, desconto, total, multa, retido, estorno | Números tabulares |
| Resumo financeiro | Reserva, cancelamento, pagamento | Linhas de preço e total em destaque (ver [ui-messages.md](ui-messages.md)) |
| Tabela | Padrão, com ordenação, linha selecionada, vazia | No celular vira lista de cartões |
| Filtros | Barra de filtros, chips ativos | — |
| Menu lateral | Expandido, recolhido, item ativo (`primary-soft` + `primary`) | Painel, computador e tablet |
| Navegação inferior | 4 itens com item ativo | Portal, celular |
| Gaveta de menu | Fechada, aberta | Painel, celular |
| Painel de confirmação | Modal (computador e tablet), folha inferior (celular) | Obrigatório para ações financeiras (R6) |
| Aviso em linha | Info, sucesso, alerta, erro | Ícone + texto, ação opcional |
| Notificação rápida (toast) | Sucesso, erro | Some em 5 s; pode ser dispensada |
| Estado vazio | Ilustração em `lilac-soft` + ação sugerida | Obrigatório em toda lista |
| Esqueleto de carregamento | Cartão, linha de tabela, formulário | Para esperas acima de 400 ms |
| Linha do tempo | Item com estado, data, hora, responsável | Histórico (RN09) |
| Item de aviso | Lido, não lido | Central de avisos |
| Indicador de sino | Com contador | — |
| Avatar | Com iniciais | — |
| Cartão de métrica | Número + descrição | Relatórios |
| Gráfico de barras e colunas | Com legenda e tabela alternativa | Relatórios |
| Passos (stepper) | 3 passos: Espaço, Horário, Resumo | Criação de reserva |
| Seletor de plano | Cartão com desconto, preço e duração | — |
| Seletor de cliente | Busca com resultado | Reserva em nome do cliente |

## 6. Cartão de espaço (referência da marca)

Ordem dos elementos: etiqueta de tipo ("Sala de reunião"), nome ("Sala Aurora"), capacidade e
local ("até 8 pessoas · 3º andar"), preço por hora, botão primário "Reservar" e link "Detalhes".
Para membro, mostrar o preço cheio riscado e o preço com desconto (F02). Indisponível: botão
desabilitado com motivo ("Sem horário livre neste período").

## 7. Acessibilidade

Contraste conforme [research.md](../research.md) R1; foco visível em todo controle; ordem de
tabulação lógica; rótulo em todo campo; erro descrito em texto e associado ao campo; alvos de
toque de 44 px; gráficos com tabela alternativa; ações com verbo claro.
