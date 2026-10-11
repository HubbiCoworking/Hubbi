# Quickstart: Verificação do Protótipo

Cenários para provar, no protótipo, que o briefing foi atendido. Cada cenário cita a história
(US), os critérios (SC) e as regras (RN). Verificar **nos três tamanhos de tela** (1440, 768 e
390 px; FR-021). Dados de exemplo em [data-model.md](data-model.md) seção 5.

## Pré-requisitos

- Biblioteca de componentes e tokens publicada ([design-system.md](contracts/design-system.md)).
- Telas T01–T45 prototipadas e ligadas conforme [screen-inventory.md](contracts/screen-inventory.md).
- Textos conforme [ui-messages.md](contracts/ui-messages.md).
- Perfis de teste: Ana (membro), Bruno (avulso), Carla (membro com pendência), Paulo (recepção),
  Marina (administradora).

## Cenários

| ID | Cenário (Given → When → Then) | US | SC | RN |
|----|-------------------------------|----|----|----|
| Q01 | Bruno entra, escolhe Sala Aurora, 2h livres → vê R$ 160,00 cheio → confirma → reserva "Aguardando pagamento" com prazo | US1 | SC-001, SC-003 | RN02, RN12 |
| Q02 | Ana faz a mesma reserva → vê R$ 160,00 riscado e R$ 128,00 → confirma → reserva "Confirmada" e cobrança pendente | US1 | SC-003 | RN02, RN13 |
| Q03 | Reserva em horário ocupado → erro MSG-04 com horários livres sugeridos | US1 | SC-002 | RN03 |
| Q04 | Reserva às 23h, ou 30 min, ou 9h de duração, ou com início em menos de 1h no portal → erros MSG-05, MSG-06, MSG-08, cada um indicando o limite | US1 | SC-002 | RN04, RN05, RN12 |
| Q05 | Carla (membro com pendência) busca espaços → vê só o preço cheio e o banner MSG-18; reserva fica "Aguardando pagamento" | US1 | SC-003 | RN13 |
| Q06 | Paulo registra o pagamento integral da reserva de Bruno → Realizado e reserva "Confirmada" | US2 | SC-004 | RN12 |
| Q07 | Paulo registra valor maior → MSG-10; valor menor → parcial com justificativa e cobrança pendente | US2 | SC-004 | RN12 |
| Q08 | Passa o término de uma reserva confirmada → Paulo marca "Concluída"; antes do término a ação está desabilitada com MSG-17 | US2 | SC-004 | RN08, RN10 |
| Q09 | Cliente abre cancelamento em três faixas (≥ 24h, entre 24h e 2h, < 2h) → vê multa e estorno antes do botão em todas | US3 | SC-005 | RN07, RN11 |
| Q10 | Membro sem pagamento cancela com menos de 2h → vê multa 100% como cobrança pendente e estorno 0 (MSG-16) | US3 | SC-005 | RN07 |
| Q11 | Tentar cancelar reserva concluída, cancelada ou não compareceu → botão desabilitado com motivo | US3 | SC-004 | RN08 |
| Q12 | Visitante cadastra-se com e-mail já usado → MSG-01 com "Entrar" e "Recuperar senha" | US4 | SC-002 | RN14 |
| Q13 | Cliente logado só vê as próprias reservas, pagamentos e dados; URL de outra reserva mostra MSG-27 | US4 | SC-008 | RN17 |
| Q14 | Marina cria espaço e plano de 20% → busca mostra o preço correto; salvar mostra MSG-19 | US5 | SC-003 | RN02, RN06 |
| Q15 | Inativar espaço com reservas futuras → MSG-20 com a lista | US5 | SC-004 | RN15 |
| Q16 | Cliente solicita plano → MSG-22; Paulo registra o pagamento → plano ativo e desconto na próxima reserva | US6 | SC-003 | RN13 |
| Q17 | Cancelar ou trocar plano → MSG-21 (sem devolução) | US6 | — | RN13 |
| Q18 | Central de avisos mostra criada, confirmada, cancelada com multa, expirada, lembrete, plano a vencer | US7 | — | RN16 |
| Q19 | Relatório de pagamentos mostra receita = realizados − estornos; período sem dados mostra MSG-25 | US7 | — | RN18 |
| Q20 | Desativar o último administrador → MSG-26; Paulo (recepção) não vê telas de espaços, planos e equipe | — (F12) | SC-008 | RN17 |
| Q21 | Anonimizar cliente → MSG-24 e histórico preservado | US4 | — | RN15 |

## Verificação transversal

1. **Três tamanhos**: toda tela existe em 1440, 768 e 390 px, sem rolagem horizontal; tabelas viram
   cartões no celular (FR-021, SC-009).
2. **Estados**: toda lista tem estado vazio; toda ação assíncrona tem carregando e erro.
3. **Rastreabilidade**: cada tela mostra, na camada de anotações do arquivo, os FR e RN que realiza
   (FR-020, SC-006).
4. **Acessibilidade**: contraste conforme [research.md](research.md); foco visível; nenhum estado só
   por cor.
5. **Valores**: os resultados de Q01, Q02, Q09 e Q10 conferem com a tabela de valores de exemplo
   (R$ 160,00; R$ 128,00; R$ 80,00; R$ 128,00).
6. **Logo e marca**: logo nos 4 tamanhos (56, 32, 20 px e ícone de app), sem uso da Pervinca como
   texto.

## Teste de usabilidade (SC-007)

Com pelo menos 5 pessoas, sem ajuda: (a) reservar a Sala Aurora e (b) cancelar essa reserva.
Meta: 80% concluem as duas tarefas. Medir também o tempo de login ao resumo final (meta: até 3
minutos, SC-001) e registrar dúvidas por tela.

## Resultado esperado

Todos os cenários Q01–Q21 aprovados nos três tamanhos, com anotações de FR e RN em todas as telas,
quadro de versionamento atualizado e decisões abertas do [plan.md](plan.md) resolvidas.
