# Feature Specification: Comodidades na reserva (café e snacks)

**Feature Branch**: `feat/HBB-003`

**Created**: 2026-10-11

**Status**: Draft

**Input**: User description: "O cliente diz para que vai usar o espaço e, conforme a finalidade
(ex.: reunião), o Hubbi oferece café, snacks e o que ele escolher, como comodidade durante o uso."

> Esta spec **estende a spec 001** e segue seus códigos: continua a numeração de regras (RN24 em
> diante), requisitos (FR-027 em diante), critérios (SC-013 em diante), mensagens (MSG-27 em
> diante) e telas (T48). Regras da spec 001 são citadas por código, nunca repetidas
> (Constituição, princípios II e V).

## Decisões de origem (brainstorming de 2026-10-11)

- Comodidades são **pagas, numa cobrança separada ligada à reserva**; o preço do espaço (RN06,
  Princípio IV) não muda.
- **Preço fixo**: o desconto do plano não vale nos itens.
- **Pontos verdes** podem pagar itens por **troca direta** (preço em pontos por unidade).
- Quantidade por **"Quantas pessoas?"** e **ajuste item a item**.
- **Sem prazo para pedir**; a cozinha entrega em qualquer momento **dentro do horário da reserva**.
- **Item não entregue cancela sem custo**; pontos voltam; item entregue é cobrado.
- Pedido **no resumo antes de confirmar (T07)** e **no detalhe da reserva (T12)**.

## Clarifications

_(a preencher na etapa de clarificação)_

## Atores

Os mesmos da spec 001. Nesta versão do MVP, só o **Cliente** (avulso ou membro) usa o portal; as
ações da **Recepção/Cozinha** (entregar item, registrar pagamento) ficam **simuladas** na barra
"Estados do protótipo", como nas telas atuais (PRD, escopo do MVP).

## User Scenarios & Testing *(mandatory)*

### User Story 11 - Pedir comodidades ao reservar (Priority: P2)

Ao revisar a reserva, o cliente informa para que vai usar o espaço e quantas pessoas vêm; o Hubbi
sugere itens para essa finalidade; ele ajusta e confirma reserva e pedido juntos.

**Why this priority**: é o caminho principal da funcionalidade e o momento em que o cliente já
está decidindo o que precisa.

**Independent Test**: escolher um espaço, abrir o resumo, marcar "Reunião de equipe", conferir
o kit sugerido, ajustar quantidades e confirmar: a reserva e o pedido aparecem em T08 com os
valores separados.

**Acceptance Scenarios**:

1. **Given** o resumo da reserva (T07), **When** o cliente escolhe a finalidade, **Then** o
   sistema sugere os itens do kit dessa finalidade com a quantidade igual ao número de pessoas
   (RN24, RN26).
2. **Given** a sugestão, **When** o cliente muda "Quantas pessoas?", **Then** os itens por pessoa
   que ele ainda não ajustou acompanham o novo número; os ajustados à mão ficam como estão (RN26).
3. **Given** itens escolhidos, **When** o cliente olha os valores, **Then** vê o valor do espaço
   (RN06) e, separado, o valor das comodidades, sem desconto do plano (RN26).
4. **Given** itens com preço em pontos e saldo suficiente, **When** o cliente marca "Pagar com
   pontos" em unidades, **Then** o valor em reais cai e o saldo previsto diminui (RN22 ampliada).
5. **Given** o cliente confirma, **Then** a reserva é criada como hoje (RN12, RN13) e o pedido
   fica ligado a ela com os preços gravados e os itens *a entregar* (RN26).
6. **Given** o cliente não escolhe finalidade nem itens, **Then** a reserva segue exatamente como
   hoje, sem pedido (RN24).

---

### User Story 12 - Pedir, acompanhar e cancelar itens no detalhe da reserva (Priority: P2)

Depois de reservar, o cliente pede mais itens, vê o que já foi entregue e cancela o que ainda não
chegou.

**Why this priority**: sem prazo para pedir (RN26), o cliente precisa de um lugar para pedir
depois e para desistir de itens.

**Independent Test**: abrir uma reserva ativa em T12, pedir 2 cafés, simular "Cozinha entregou"
em um item e cancelar o outro: o primeiro fica cobrado e o segundo some do total, sem custo.

**Acceptance Scenarios**:

1. **Given** uma reserva *pendente* ou *confirmada* que ainda não terminou, **When** o cliente
   abre T12, **Then** vê o cartão "Comodidades" com "Pedir itens" (RN26).
2. **Given** um item *a entregar*, **When** o cliente cancela, **Then** o item fica *cancelado*,
   sai do valor e os pontos usados nele voltam ao saldo (RN27).
3. **Given** um item *entregue*, **Then** o botão de cancelar não aparece e o item é cobrado
   (RN27).
4. **Given** o cliente cancela a reserva (RN07), **Then** os itens não entregues ficam
   *cancelados* sem multa e os entregues seguem cobrados (RN27).
5. **Given** a reserva terminou, foi concluída, cancelada ou virou *no-show*, **Then** não é
   possível pedir itens (RN26).

### Edge Cases

- Pessoas acima da capacidade do espaço: o campo não aceita (máximo = lugares, RN26).
- Pontos insuficientes para as unidades marcadas: o sistema limita ao saldo e explica (MSG-28).
- Pedido no T12 usa o saldo de pontos **atual**; pontos já comprometidos em outros pedidos não
  entregues contam como usados (RN22 ampliada).
- Cliente cancela todos os itens: o pedido continua no histórico com valor zero (RN09 aplica-se
  por analogia: nada é apagado).
- Preço de item muda depois do pedido: o pedido mantém o preço gravado (RN26).
- Reserva *pendente* expira sem pagamento (RN12): itens não entregues são cancelados sem custo.
- Membro com cobrança vencida (Clarificação 2026-10-06 da spec 001): pode pedir; preço dos
  itens é o mesmo para todos.
- Item com restrição alimentar: a restrição aparece em texto, não só em ícone.

## Requirements *(mandatory)*

### Regras de Negócio

- **RN24 — Finalidade da reserva**: ao reservar, o cliente pode informar a finalidade: *reunião
  de equipe*, *foco individual*, *desenvolvimento*, *criativo e marketing* ou *outro*. É
  opcional; vem preenchida quando a busca usou um atalho de necessidade (RN20). Serve para
  sugerir itens (RN26) e não muda preço, disponibilidade nem estado da reserva.

- **RN25 — Cardápio de comodidades**: o administrador mantém o cardápio. Cada item tem nome,
  descrição curta, tipo de quantidade (*por pessoa* ou *por unidade*), preço em reais, preço em
  pontos (opcional), restrições alimentares (*vegano*, *sem glúten*, *sem lactose*) e situação
  (ativo/inativo; item inativo não aparece para novos pedidos). Para cada finalidade (RN24) há
  um **kit sugerido** (lista de itens). Valem para todos os tipos de espaço.

- **RN26 — Pedido de comodidades**:
  - Pode ser feito **no resumo, antes de confirmar a reserva**, e **no detalhe da reserva**,
    enquanto ela estiver *pendente* ou *confirmada* e o horário não tiver terminado. Não há
    antecedência mínima.
  - "Quantas pessoas?" vai de 1 até os lugares do espaço; padrão: os lugares do espaço. Itens
    *por pessoa* seguem esse número até o cliente ajustá-los; todo item aceita ajuste de
    quantidade (0 a 50 unidades por pedido).
  - Valor = soma de quantidade × preço de cada item, **sem desconto do plano** (RN13 não se
    aplica). Preço em reais, preço em pontos e quantidade são **gravados** no pedido.
  - O valor das comodidades é uma **cobrança separada**, ligada ao cliente e à reserva, com
    situação *pendente*, *realizado* ou *cancelado* (Princípio IV). Fica pendente até a equipe
    registrar o pagamento na recepção, como a reserva (RN12); não altera o estado da reserva.
  - A cozinha entrega em qualquer momento **dentro do horário da reserva**; não há horário
    marcado de entrega.
  - Cada item passa por: *a entregar* → *entregue* ou *a entregar* → *cancelado*.
  - Opção **"Sem descartáveis"** por pedido (canecas e copos da casa); não muda preço.

- **RN27 — Cancelamento das comodidades**: item *a entregar* pode ser cancelado pelo cliente a
  qualquer momento, **sem custo**; os pontos usados nele voltam ao saldo. Item *entregue* não pode
  ser cancelado e é cobrado. Quando a reserva é cancelada (RN07) ou expira (RN12), os itens *a
  entregar* são cancelados sem custo, e a multa da RN07 continua valendo só para o espaço.

- **RN22 (ampliada) — Troca de pontos por itens**: além do desconto na reserva, itens com preço
  em pontos podem ser pagos com pontos, **unidade por unidade**, até o saldo disponível. Os
  pontos saem do saldo quando o pedido é confirmado, com lançamento no extrato (tipo *troca por
  item*), e voltam (tipo *devolução*) se o item for cancelado (RN27).

### Functional Requirements

- **FR-027**: O cliente MUST poder informar a finalidade da reserva no resumo, opcionalmente,
  com preenchimento a partir do atalho de busca (RN24).
- **FR-028**: O sistema MUST sugerir o kit da finalidade com quantidades pelo número de pessoas
  e permitir ajustar cada item (RN25, RN26).
- **FR-029**: O cliente MUST poder pedir comodidades no resumo e no detalhe da reserva, dentro
  das condições da RN26.
- **FR-030**: O sistema MUST mostrar o valor do espaço e o valor das comodidades separados,
  antes de confirmar, e gravar o pedido com os preços (RN06, RN26).
- **FR-031**: O cliente MUST poder pagar unidades com pontos verdes, limitado ao saldo, com
  lançamento e devolução no extrato (RN22 ampliada, RN27).
- **FR-032**: O cliente MUST ver a situação de cada item (*a entregar*, *entregue*, *cancelado*)
  e cancelar itens *a entregar* sem custo (RN27).
- **FR-033**: Ao cancelar ou expirar a reserva, o sistema MUST cancelar os itens *a entregar*
  sem custo e devolver os pontos (RN27, RN07, RN12).
- **FR-034**: O protótipo MUST simular as ações da equipe "Cozinha entregou" e "Recepção
  registrou pagamento das comodidades".
- **FR-035**: A escolha de itens MUST ser acessível: quantidades com rótulo, restrições em
  texto, total anunciado ao mudar, painel com foco preso e Esc fecha (padrão das telas atuais).

### Mensagens (continua ui-messages)

| Código | Situação | Texto |
|--------|----------|-------|
| MSG-27 | Entrega | "Entregamos no seu espaço durante a reserva." |
| MSG-28 | Pontos insuficientes | "Você tem {saldo} pontos. Dá para pagar {n} unidade(s) com pontos." |
| MSG-29 | Cancelar item | "Cancelar {item}? Ele ainda não foi entregue, então não há custo." Botões: **Cancelar item** / **Manter** |
| MSG-30 | Reserva encerrada | "Esta reserva já terminou. Não é possível pedir comodidades." |
| MSG-31 | Cobrança separada | "As comodidades são uma cobrança separada, paga na recepção. O desconto do plano vale só para o espaço." |

### Telas

| Código | Tela | Mudança |
|--------|------|---------|
| T07 | Resumo da reserva | Cartão "Comodidades": finalidade, "Quantas pessoas?", kit sugerido, botão para escolher itens; valores em duas partes |
| T48 | Escolher comodidades | **Nova.** Painel (folha no celular, diálogo no computador) com o cardápio, quantidades, restrições, "Pagar com pontos" e "Sem descartáveis" |
| T08 | Reserva feita | Lista dos itens e valor das comodidades |
| T12 | Detalhe da reserva | Cartão "Comodidades": itens com situação, "Pedir itens" (abre T48), "Cancelar item" |
| T46 | Hubbi Verde | Extrato mostra *troca por item* e *devolução* |

### Key Entities

- **ComodidadeItem** (cardápio): id, nome, descrição, tipo (*por pessoa*/*por unidade*), preço,
  preço em pontos (opcional), restrições, ativo.
- **KitSugerido**: finalidade → lista de itens.
- **PedidoComodidades**: id, reserva, cliente, finalidade, pessoas, sem descartáveis, criado em,
  linhas, cobrança (valor, pago, situação).
- **LinhaPedido**: item, quantidade, preço gravado, preço em pontos gravado, unidades pagas com
  pontos, situação (*a entregar*/*entregue*/*cancelado*), datas de entrega e cancelamento.
- **Reserva** (spec 001): ganha a finalidade (RN24) e passa a ter zero ou mais pedidos.

## Success Criteria *(mandatory)*

- **SC-013**: O cliente pede o kit sugerido para uma reunião em até 3 toques a partir do resumo.
- **SC-014**: Em 100% dos pedidos, o valor do espaço e o das comodidades aparecem separados
  antes de confirmar.
- **SC-015**: Cancelar um item não entregue nunca gera custo e devolve 100% dos pontos usados.
- **SC-016**: As telas T07, T48 e T12 passam na verificação de layout do CLAUDE.md (1920 a 360 px,
  sem rolagem lateral, alvos de 44 px) e são operáveis só pelo teclado.

## Assumptions

- Cardápio e preços de exemplo, fictícios (ajustáveis pelo administrador):
  café coado R$ 5 / 30 pts (por pessoa); chá R$ 4 / 25 pts; água R$ 3 / 20 pts; pausa café
  (café, água e biscoitos) R$ 14 / 80 pts; lanche natural R$ 18 (por pessoa); bandeja de frutas
  R$ 32 (por unidade, serve 6); garrafa térmica de café 1 L R$ 20 / 120 pts (por unidade).
- Kits: reunião → pausa café; foco → café para 1; desenvolvimento → café e água; criativo e
  marketing → pausa café e bandeja de frutas; outro → nenhum.
- Fora do escopo: painel da cozinha/recepção (simulado), horário marcado de entrega, pagamento
  online, estoque.
- **Emenda da constituição** (MINOR, 1.0.0 → 1.1.0): o Princípio I passa a incluir "comodidades
  pedidas junto à reserva, cobradas à parte". Exige aprovação da maioria da equipe.
