# Contrato: Quadro de Versionamento do Briefing e do Protótipo

Exigido pela Constituição (Fluxo de Trabalho e Qualidade): toda alteração no documento ou no
protótipo gera uma entrada com versão, responsável e descrição. Numeração sequencial e sem
lacunas (Princípio V). Mudança de regra de negócio exige revisão de outro integrante.

| Versão | Data | Responsável | Descrição | Revisor |
|--------|------|-------------|-----------|---------|
| 0.1 | 2026-10-05 | Equipe Hubbi | Spec 001 inicial: atores, histórias, RN01–RN18, FR-001–FR-020, fluxos F01–F12 | A definir |
| 0.2 | 2026-10-06 | Equipe Hubbi | Rodadas de clarificação: multa de membro, parcial, antecedência, cobrança vencida, plano, documento, LGPD, NFR (FR-021, SC-009); sincronização de `fluxos.md` | A definir |
| 0.3 | 2026-10-06 | Equipe Hubbi | Plano de briefing de design: research, data-model, design-system, screen-inventory, ui-messages, quickstart | A definir |
| 0.4 | 2026-10-10 | Equipe Hubbi | Segmento social e sustentável alinhado aos ODS 8, 10, 11 e 12: US8, RN19–RN21, FR-022–FR-024, SC-010; extensões de F02, F07, F08 e F11; `data-model.md`; `escopo-impacto-social-ods.md` | Pendente (muda RN) |
| 0.5 | 2026-10-10 | Equipe Hubbi | Características do espaço e filtros por necessidade (US9, RN20 ampliada, FR-023, SC-011); programa Hubbi Verde (US10, RN22–RN23, FR-025–FR-026, SC-012); RN06 e RN21 ampliadas; US8 reduzida ao plano social; `data-model.md` | Pendente (muda RN) |
| 0.6 | 2026-10-10 | Equipe Hubbi | PRD, TRD e design.md do MVP (`docs/`); escopo do MVP só com perfil Cliente, ações da equipe simuladas, relatório de impacto como página pública `/impact` (diverge da RN21, que o prevê para a gestão); novas telas T46 (Hubbi Verde) e T47 (Nosso impacto); rotas da URL em inglês | Pendente (diverge de RN) |
| 0.7 | 2026-10-11 | Equipe Hubbi | Fluxo de planos do MVP (T28 + T29): contratar, trocar, cancelar e renovar (≤ 5 dias) conforme RN13. Plano Social com observação opcional de até 140 caracteres e análise pela gerência antes do pagamento (diverge da RN19, que grava só categoria, data e responsável) | Pendente (muda RN19) |
| 0.8 | 2026-10-11 | Equipe Hubbi | Tela Nosso impacto (T47): os oito indicadores da RN21 com fórmulas e denominadores explícitos (horas reservadas, capacidade perdida, ocupação, horas liberadas) e períodos de 30 dias, 90 dias e todo o período | Pendente (detalha RN21) |
| 0.9-protótipo | 2026-10-11 | Equipe Hubbi | Revisão de design e acessibilidade (WCAG 2.2 AA): foto ilustrativa de cada espaço com texto alternativo descritivo em T04, T07, T08, T12 e na landing (fotos do Unsplash em `public/spaces/`); link “Pular para o conteúdo”; foco no título ao trocar de página; painel “Mais” com foco preso; botão “Acessibilidade” (tamanho do texto, alto contraste, sublinhar links, reduzir animações); contraste do interruptor desligado; página não encontrada do portal sem `<main>` duplicado; VLibras (Libras) em todas as páginas. Não muda RN | Não exige (sem RN) |
| 0.10 | 2026-10-11 | Equipe Hubbi | Spec 002 Comodidades na reserva (`specs/002-comodidades-reserva/spec.md`): US11–US12, RN24–RN27, RN22 ampliada (troca de pontos por itens), FR-027–FR-035, MSG-27–MSG-31, tela T48; propõe emenda MINOR do Princípio I | Pendente (nova RN e emenda) |
| 0.10-protótipo | 2026-10-11 | Equipe Hubbi | Comodidades no protótipo (spec 002): cartão em T07, painel T48, situação em T08 e T12, troca de pontos e devolução no extrato (T46); formato de dados v5 com migração; ajustes de celular (avisos, VLibras, área segura, concordância) | Pendente (spec 002 e emenda) |

Regras de uso: o campo "Responsável" é preenchido por quem alterou; "Revisor" é obrigatório quando
a alteração muda uma RN. O protótipo no Figma ou Claude Design registra suas versões na mesma
tabela, com o sufixo "-protótipo" (ex.: `0.4-protótipo`).
