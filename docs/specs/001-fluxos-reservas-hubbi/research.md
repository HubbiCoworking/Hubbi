# Research: Decisões de Design do Hubbi

Resolve as incógnitas do plano. Todas as decisões são independentes de ferramenta (Figma ou Claude
Design).

## R1. Contraste da paleta recebida

Razões calculadas pela fórmula de luminância relativa do WCAG 2.2.

| Combinação | Razão | Uso permitido |
|------------|------:|---------------|
| Branco sobre Principal `#4A56C8` | 6,08:1 | Texto de botão primário (AA) |
| Principal sobre Fundo `#F7F6FC` | 5,65:1 | Links, ícones ativos, anel de foco (AA) |
| Principal sobre Azul suave `#E5E7FA` | 4,96:1 | Item ativo do menu (AA) |
| Lilás profundo `#654AA6` sobre Lilás suave `#E3D9F6` | 5,03:1 | Etiquetas (AA) |
| Lilás profundo sobre Fundo | 6,34:1 | Texto e ícones secundários (AA) |
| Lilás profundo sobre Azul suave | 5,56:1 | Texto em destaque (AA) |
| Texto `#1E1D2B` sobre Fundo | 15,44:1 | Corpo e títulos (AAA) |
| Texto sobre Azul suave | 13,54:1 | Corpo em áreas de destaque (AAA) |
| Roxo Hubbi `#38265F` sobre Fundo | 12,13:1 | Símbolo e wordmark |
| Pervinca da logo `#91A3DC` sobre Fundo | **2,31:1** | **Só decoração.** Reprova AA para texto e para controles |

**Decisão**: a paleta cobre texto, ações e destaques em AA. A Pervinca `#91A3DC` fica restrita ao
símbolo e a ilustrações.
**Alternativa rejeitada**: usar a Pervinca em bordas de campos (reprova 3:1 para componentes).

## R2. Cores semânticas ausentes

A paleta recebida não define erro, sucesso nem alerta. Sem elas não há como diferenciar "multa" de
"estorno" ou "pendente" de "confirmada". **Propostas** (a aprovar):

| Papel | Fundo suave | Texto e ícone | Observação |
|-------|-------------|---------------|------------|
| Sucesso (confirmada, realizado) | `#E3F4EA` | `#17633A` | Validar contraste na ferramenta |
| Alerta (pendente, prazo perto) | `#FDF1D8` | `#7A4B00` | Validar contraste na ferramenta |
| Erro (cancelada, multa, validação) | `#FBE3E3` | `#A12626` | Validar contraste na ferramenta |
| Informação | Azul suave `#E5E7FA` | Principal `#4A56C8` | 4,96:1 |
| Neutro (concluída, inativo) | `#ECEBF3` | `#4A4860` | Validar contraste na ferramenta |

Os pares de sucesso, alerta, erro e neutro **não foram calculados**; devem atingir pelo menos
4,5:1 na verificação da ferramenta, escurecendo o texto se necessário.
Regra: **nunca comunicar estado só por cor**. Todo estado tem rótulo de texto e ícone.

## R3. Tokens derivados

- **Borda de campo**: Texto `#1E1D2B` a 40% sobre Fundo (alvo ≥ 3:1 para controles).
- **Foco visível**: anel de 2 px em Principal com deslocamento de 2 px, em todo controle.
- **Superfícies**: Fundo `#F7F6FC` na base; cartões brancos com sombra suave e borda de 1 px em
  Texto a 8%; Azul suave para seleção e hover.
- **Desabilitado**: o motivo aparece em texto ao lado ou em dica (ex.: RN08), nunca só o controle
  apagado.

## R4. Tipografia

A marca mostra sans arredondada sem nomear a fonte. **Decisão**: Nunito para títulos e wordmark;
Inter para corpo, tabelas e formulários. Escala: 12, 14 (corpo), 16, 20, 24, 32.
**Alternativa**: só Nunito; rejeitada porque tabelas de pagamentos ficam menos legíveis em tamanho
pequeno. Confirmar a fonte oficial, se existir.

## R5. Responsividade (FR-021)

Três frames por tela: Computador 1440 px, Tablet 768 px, Celular 390 px. Grid de 12 colunas
(computador), 8 (tablet) e 4 (celular), com margens de 32, 24 e 16 px.

- **Portal do Cliente**: prioridade celular. Navegação inferior com 4 itens (Espaços, Reservas,
  Plano, Avisos); perfil no topo.
- **Painel da Equipe**: prioridade computador e tablet. Menu lateral recolhível; no celular vira
  gaveta. Tabelas viram listas de cartões no celular.
- Alvos de toque de no mínimo 44 × 44 px.

## R6. Ações financeiras e destrutivas

SC-005 exige mostrar multa e estorno **antes** de confirmar. **Decisão**: toda ação com efeito
financeiro (cancelar, registrar pagamento, estornar) e a anonimização abrem um painel de
confirmação com resumo de valores e dois botões: ação principal com verbo e valor (ex.:
"Cancelar e reter R$ 100,00") e "Voltar". Sem confirmação genérica "Tem certeza?".

## R7. Dados de exemplo

Dados fictícios coerentes com a spec (ver [data-model.md](data-model.md)): espaços no padrão da
marca (Sala Aurora, até 8 pessoas, 3º andar), três planos (10%, 20%, 30%), clientes com e sem
plano e um cliente com cobrança vencida.

## R8. Formatos de exibição

- Moeda `R$ 1.234,56`. Data `06/10/2026`; em listas, "ter, 6 out". Hora `14:30` (24 h).
- Duração `1h30`. Intervalo `14:00 – 15:30`. Antecedência no cancelamento: "faltam 5h 20min".
- Não exibir fuso; vale o horário local do espaço.

## R9. Ícones

Conjunto único de traço (2 px, cantos arredondados) para combinar com o símbolo: calendário,
relógio, pessoas, local, valor, sino, alerta, check, fechar, filtro, busca, usuário, engrenagem,
gráfico, plano, espaço, cadeado.

## Incógnitas restantes

Nenhuma bloqueia o início do desenho. Pendentes de aprovação: plataforma, cores semânticas, fonte
oficial, vetores da marca (ver [plan.md](plan.md#decisões-abertas-precisam-do-responsável-antes-de-o-agente-começar)).
