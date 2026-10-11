# Implementation Plan: Briefing de Design do Hubbi (Fluxos de Reservas)

**Branch**: `001-fluxos-reservas-hubbi` (sem git; pasta de spec apenas) | **Date**: 2026-10-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-fluxos-reservas-hubbi/spec.md`

> **Natureza deste plano**: o entregável da v1 é **documento + protótipo navegável** (Constituição,
> Escopo e Restrições). Este plano é, portanto, um **briefing de design** para um agente de design
> (Figma AI ou Claude Design), e não um plano de código. Os artefatos são Markdown e não dependem
> da ferramenta de design escolhida.

## Summary

Traduzir a spec 001 (fluxos F01–F12, RN01–RN18, FR-001–FR-021) em um briefing que um agente de
design consiga executar sozinho: identidade visual do Hubbi, design system (tokens, componentes,
estados), inventário de telas por fluxo com os FR e RN que cada uma realiza (FR-020), estados
obrigatórios, três tamanhos de tela (FR-021) e critérios de aceite ligados aos SC. As regras de
negócio que o usuário precisa *ver* (preço, multa e estorno antes de confirmar) têm texto e
comportamento definidos em [contracts/ui-messages.md](contracts/ui-messages.md).

## Technical Context

**Language/Version**: N/A (entregável de design; Markdown como formato de briefing)

**Primary Dependencies**: Ferramenta de design a definir (Figma ou Claude Design); briefing agnóstico. Imagens da marca recebidas: paleta e logo (ver Identidade Visual); copiar os originais, de preferência vetoriais, para a pasta do projeto antes de entregar ao agente.

**Storage**: N/A (sem persistência; protótipo usa dados de exemplo)

**Testing**: Verificação do protótipo contra [quickstart.md](quickstart.md) (cenários de aceite) e teste de usabilidade com 5 pessoas (SC-007)

**Target Platform**: Computador, tablet e celular (FR-021): frames de 1440, 768 e 390 px de largura

**Project Type**: Protótipo navegável de aplicação web responsiva (Portal do Cliente + Painel da Equipe)

**Performance Goals**: Operações comuns em até 2 s (FR-021, SC-009); no protótipo, estados de carregamento desenhados para qualquer espera acima de 400 ms

**Constraints**: Stack tecnológica não é restrição (Constituição); acessibilidade mínima WCAG 2.2 AA (contraste verificado em [research.md](research.md)); textos em português do Brasil; sem gateway de pagamento (pagamento sempre manual pela equipe)

**Scale/Scope**: 12 fluxos, 2 superfícies (Portal do Cliente e Painel da Equipe), 45 telas-base × 3 tamanhos (ver [contracts/screen-inventory.md](contracts/screen-inventory.md))

## Constitution Check

*GATE: passou antes da pesquisa; reavaliado após o desenho (Phase 1) e continua passando.*

| Princípio | Verificação neste plano | Status |
|-----------|-------------------------|--------|
| I. Escopo enxuto | Nenhuma tela para eventos, comunidade, NPS, acesso físico, recorrência ou gateway; só reservas, clientes, planos, preços e pagamentos manuais | Passa |
| II. RN como fonte da verdade | O briefing cita RN por código e nunca reescreve a regra | Passa |
| III. Integridade das reservas | Telas respeitam o ciclo de vida (RN08): ação inválida aparece desabilitada com motivo; não existe botão "excluir reserva" | Passa |
| IV. Precificação transparente | Preço cheio, desconto, valor final, multa e estorno aparecem antes de confirmar (SC-005); valor congelado visível no detalhe da reserva (RN06) | Passa |
| V. Rastreabilidade | Cada tela cita FR e RN; cada fluxo cobre caminho feliz e erros (FR-020); códigos estáveis | Passa |
| VI. Segurança e LGPD | Dois perfis (portal e equipe); mensagem de login genérica; nenhum dado de outro cliente (SC-008); anonimização prevista (RN15) | Passa |
| Desempenho e responsividade | FR-021 e SC-009 viram frames em 3 tamanhos e estados de carregamento | Passa |
| Versionamento do documento | Quadro de versões em [contracts/design-brief-versioning.md](contracts/design-brief-versioning.md) | Passa (ver Complexity Tracking) |

Nenhuma violação injustificada.

## Project Structure

### Documentation (this feature)

```text
specs/001-fluxos-reservas-hubbi/
├── plan.md                              # Este arquivo (briefing de design)
├── spec.md                              # Fonte das regras (RN) e dos requisitos (FR)
├── fluxos.md                            # Diagramas Mermaid F01–F12
├── research.md                          # Phase 0: decisões de design e contraste
├── data-model.md                        # Phase 1: conteúdo e estados que a UI exibe
├── quickstart.md                        # Phase 1: cenários de verificação do protótipo
├── checklists/requirements.md
├── contracts/
│   ├── design-system.md                 # Tokens, tipografia, componentes e estados
│   ├── screen-inventory.md              # Telas por fluxo, com FR, RN e estados
│   ├── ui-messages.md                   # Textos de erro, avisos e resumos financeiros
│   └── design-brief-versioning.md       # Quadro de versionamento do briefing
└── tasks.md                             # Phase 2 (/speckit-tasks; NÃO criado aqui)
```

### Source Code (repository root)

Não há código-fonte na v1. O entregável fora desta pasta é o arquivo de design, organizado assim:

```text
Arquivo de design "Hubbi v1"
├── 00 Fundamentos        # logo, cores, tipografia, grid, ícones, espaçamentos
├── 01 Componentes        # biblioteca com variantes e estados
├── 02 Portal do Cliente  # F01, F02, F03, F05, F08 (lado cliente), F10
├── 03 Painel da Equipe   # F02, F03, F04, F05, F06, F07, F08, F09, F11, F12
└── 04 Fluxos             # protótipo navegável + legenda de FR e RN por fluxo
```

**Structure Decision**: duas superfícies (Portal do Cliente e Painel da Equipe), por causa dos
dois perfis da Constituição (VI). O Painel é priorizado para computador e tablet; o Portal, para
celular. Os três tamanhos são entregues nas duas superfícies (FR-021).

## Identidade Visual (resumo; detalhes em contracts/design-system.md)

- **Marca**: símbolo de três pessoas ao redor de uma mesa triangular vista de cima ("Três
  pessoas, uma mesa, um ponto de encontro"); wordmark "Hubbi" em sans arredondada. Roxo Hubbi
  `#38265F` (pessoas) e Pervinca `#91A3DC` (mesa). Funciona em 56, 32 e 20 px e como ícone de app
  (fundo roxo escuro).
- **Paleta de interface "Opção C Pervinca"**: Principal `#4A56C8`, Azul suave `#E5E7FA`, Lilás
  suave `#E3D9F6`, Lilás profundo `#654AA6`, Fundo `#F7F6FC`, Texto `#1E1D2B`.
- **Regra de uso**: a Pervinca `#91A3DC` da logo tem contraste 2,31:1 sobre o Fundo e **não** serve
  para texto nem para bordas de controle; usar só no símbolo e em ilustração.
- **Cores semânticas** (sucesso, alerta, erro) não existem na paleta recebida; propostas em
  [research.md](research.md), **sujeitas a aprovação**.

## Ordem de prototipação (por prioridade das user stories)

| Onda | Histórias | Fluxos | Por quê |
|------|-----------|--------|---------|
| 0 | — | Fundamentos e Componentes | Todas as telas dependem deles |
| 1 | US4 (cadastro mínimo, pré-requisito do login de US1) | F01 | O cliente precisa entrar para reservar |
| 1 | US1, US2 (P1) | F02, F03, F04, F06 | Coração do produto: reservar, pagar, encerrar |
| 2 | US3, US4, US5 (P2) | F05, F09, F07 | Cancelamento com multa, clientes e espaços |
| 3 | US6, US7 (P3) | F08, F10, F11, F12 | Planos, avisos, relatórios e equipe |

Critério de passagem entre ondas: todos os cenários da onda no [quickstart.md](quickstart.md)
verificados nos três tamanhos de tela.

## Decisões abertas (precisam do responsável antes de o agente começar)

1. **Plataforma-alvo**: Figma (Figma AI) ou Claude Design? O briefing é agnóstico; só muda o
   empacotamento da entrega.
2. **Cores semânticas**: aprovar as propostas de [research.md](research.md).
3. **Tipografia**: a marca mostra sans arredondada sem nomear a fonte. Proposta: Nunito (títulos e
   wordmark) + Inter (corpo). Confirmar a fonte oficial, se existir.
4. **Arquivos da marca**: entregar o símbolo em vetor (versão principal, monocromática e ícone de
   app). As imagens recebidas são rasterizadas.
5. **História para F12** (gestão da equipe): a spec ainda não tem história própria; o briefing
   cobre F12 por FR-017 e RN17 e marca a lacuna.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Quadro de versionamento em arquivo próprio | A Constituição exige quadro de versionamento para toda alteração no documento ou no protótipo | Colocá-lo em `plan.md` misturaria histórico com instruções ao agente de design |
| Plano sem "Source Code" tradicional | O entregável é protótipo; stack não é restrição | Inventar estrutura de código contrariaria a independência de tecnologia |
