# Contrato: Textos e Regras Visíveis na Interface

Catálogo de mensagens (**MSG-xx**) referenciado pelo [screen-inventory.md](screen-inventory.md).
Idioma: português do Brasil. Variáveis entre `{chaves}`. Cada mensagem cita a regra (RN) que a
origina. Regras gerais:

- Erro diz **qual limite foi violado** e **o que fazer** (SC-002).
- Nenhuma mensagem expõe dados de outro cliente nem revela qual campo de login falhou (FR-018).
- Valores em `R$ 1.234,56`; datas em `06/10/2026`; hora em `14:30`.

## 1. Cadastro e acesso

| ID | Quando | Texto | Componente | RN |
|----|--------|-------|------------|----|
| MSG-01 | E-mail ou documento já cadastrado | "Já existe uma conta com esses dados. Entre ou recupere sua senha." Ações: **Entrar**, **Recuperar senha** | Aviso em linha (erro) | RN14 |
| MSG-02 | Login inválido | "E-mail ou senha incorretos. Confira e tente de novo." (nunca indica qual campo) | Aviso em linha (erro) | RN17 |
| MSG-27 | Perfil sem permissão | "Você não tem acesso a esta página." (sem dados do recurso) | Tela de acesso negado | RN17 |

## 2. Busca e criação de reserva

| ID | Quando | Texto | Componente | RN |
|----|--------|-------|------------|----|
| MSG-03 | Nenhum espaço livre | "Nenhum espaço livre neste horário. Veja outros horários ou tipos de espaço." Ação: **Ver outros horários** | Estado vazio | RN03 |
| MSG-04 | Horário ocupado | "Esse horário já foi reservado. Escolha um dos horários livres abaixo." + sugestões de horários livres do mesmo espaço | Aviso em linha (erro) + chips | RN03 |
| MSG-05 | Fora do horário | "O espaço funciona das {abertura} às {fechamento}, de {dia inicial} a {dia final}. A reserva precisa começar e terminar no mesmo dia, dentro desse horário." | Aviso em linha (erro) | RN04 |
| MSG-06 | Duração inválida | "A duração deve ser de {mínima} a {máxima}, em intervalos de {passo}." | Aviso em linha (erro) | RN05 |
| MSG-07 | Espaço inativo ou indisponível | "Este espaço não está disponível para reserva." | Aviso em linha (erro) | RN01 |
| MSG-08 | Antecedência menor que 1h (portal) | "No portal, a reserva precisa começar com pelo menos 1 hora de antecedência. Escolha outro horário ou procure a recepção." | Aviso em linha (erro) | RN12 |
| MSG-09 | Reserva criada, avulso | "Reserva aguardando pagamento. Pague na recepção até {prazo} para confirmar; depois disso ela é cancelada sem multa." | Aviso em linha (alerta) | RN12 |
| MSG-18 | Membro com cobrança vencida | "Você tem uma cobrança vencida. Enquanto ela estiver aberta, suas reservas valem o preço cheio e ficam aguardando pagamento." Ação: **Ver cobranças** | Banner (alerta) | RN13 |
| — | Reserva criada, membro | "Reserva confirmada. A cobrança de {valor} fica pendente para a recepção registrar." | Toast (sucesso) | RN13 |

### Resumo da reserva (T07, T10)

Bloco de linhas, nesta ordem (valores com números tabulares):

```text
Sala Aurora · ter, 06/10/2026 · 14:00 – 16:00 (2h)
Preço cheio                       R$ 160,00
Desconto do plano Profissional (20%)  – R$ 32,00      (omitir a linha para avulso)
Total                             R$ 128,00
```

Botão primário: **Confirmar reserva · R$ 128,00**. Botão secundário: **Voltar**.

## 3. Pagamento (F04)

| ID | Quando | Texto | Componente | RN |
|----|--------|-------|------------|----|
| MSG-10 | Valor maior que o devido | "O valor informado (R$ {informado}) é maior que o devido (R$ {devido}). Corrija o valor." | Erro no campo | RN12 |
| MSG-11 | Valor menor que o devido | "Pagamento parcial de R$ {informado} de R$ {devido}. Informe a justificativa. A cobrança continua pendente em R$ {saldo}." | Aviso em linha (alerta) + campo obrigatório | RN12 |
| — | Pagamento integral registrado | "Pagamento registrado. Reserva confirmada." | Toast (sucesso) | RN12 |

## 4. Cancelamento (F05): multa e estorno **antes** de confirmar

Painel de confirmação com resumo. As linhas dependem da faixa:

| ID | Situação | Texto de apoio | RN |
|----|----------|----------------|----|
| MSG-12 | Pendente sem pagamento | "Esta reserva ainda não foi paga. Cancelar não gera multa nem estorno." | RN07 |
| MSG-13 | 24h ou mais antes do início | "Faltam {tempo} para o início. Cancelamento sem multa." | RN07 |
| MSG-14 | Entre 24h e 2h antes | "Faltam {tempo} para o início. Multa de 50% do valor da reserva." | RN07 |
| MSG-15 | Menos de 2h antes | "Faltam {tempo} para o início. Multa de 100% do valor da reserva." | RN07 |
| MSG-16 | Multa maior que o valor pago (inclui membro sem pagamento) | "O valor pago cobre só parte da multa. R$ {pago} ficam retidos e R$ {saldo} viram uma cobrança pendente." | RN07 |

Resumo exibido antes do botão (exemplo com reserva paga de R$ 160,00, entre 24h e 2h):

```text
Valor da reserva                  R$ 160,00
Valor pago                        R$ 160,00
Multa (50%)                      – R$ 80,00
Estorno                           R$ 80,00     (a equipe registra a devolução)
```

Exemplo do caso MSG-16 (membro, nada pago, menos de 2h):

```text
Valor da reserva                  R$ 128,00
Valor pago                        R$ 0,00
Multa (100%)                      R$ 128,00
Valor retido                      R$ 0,00
Cobrança de multa pendente        R$ 128,00
Estorno                           R$ 0,00
```

Botões: primário **Cancelar e reter R$ {retido}** (ou **Cancelar reserva** quando não há valor) e
secundário **Voltar**. Confirmação de sucesso (toast): "Reserva cancelada." Com estorno:
"Reserva cancelada. O estorno de R$ {estorno} será registrado pela recepção."

| ID | Quando | Texto | RN |
|----|--------|-------|----|
| — | Estado final | "Esta reserva não pode mais ser cancelada porque está {concluída, cancelada ou marcada como não compareceu}." (botão desabilitado com este motivo) | RN08 |

## 5. Encerramento (F06)

| ID | Quando | Texto | RN |
|----|--------|-------|----|
| MSG-17 | Antes do término | "Só é possível encerrar a reserva depois do término ({hora do término})." | RN10 |
| — | Concluir | "Marcar como concluída? A cobrança pendente de R$ {valor} continua em Pagamentos pendentes." | RN08 |
| — | Não compareceu | "Marcar como não compareceu? Esta ação não pode ser desfeita." | RN08 |

## 6. Cadastros (F07, F08, F09, F12)

| ID | Quando | Texto | RN |
|----|--------|-------|----|
| MSG-19 | Salvar preço ou desconto | "Esta alteração vale só para novas reservas. Reservas já feitas mantêm o valor original." | RN06 |
| MSG-20 | Inativar espaço com reservas futuras | "Este espaço tem {n} reservas futuras. Cancele ou remaneje essas reservas antes de inativar." Lista as reservas | RN15 |
| MSG-21 | Cancelar ou trocar plano | "Não há devolução do valor pago. O plano continua até {vencimento}; cancelar só impede a renovação, e a troca vale a partir dessa data." | RN13 |
| MSG-22 | Plano solicitado | "Solicitação enviada. O plano é ativado quando a recepção registrar o pagamento de R$ {preço}." | RN13 |
| MSG-23 | Inativar ou anonimizar com reservas futuras | "Este cliente tem {n} reservas futuras. Trate essas reservas antes de continuar." | RN15 |
| MSG-24 | Anonimizar | "Nome, e-mail, documento e telefone serão apagados e o cadastro ficará anônimo e inativo. Reservas e pagamentos permanecem no histórico. Esta ação não pode ser desfeita." Botão: **Anonimizar dados** | RN15 |
| MSG-26 | Desativar último administrador | "Não é possível desativar o último administrador ativo. Crie ou promova outro administrador primeiro." | RN17 |

## 7. Relatórios e avisos

| ID | Quando | Texto | RN |
|----|--------|-------|----|
| MSG-25 | Sem dados | "Sem dados neste período. Escolha outro período." | RN18 |
| — | Aviso de vencimento do plano | "Seu plano {nome} vence em {n} dias. Solicite a renovação para manter o desconto." | RN16 |
| — | Reserva expirada | "Sua reserva de {data} foi cancelada porque o pagamento não foi registrado a tempo. Não há multa." | RN12, RN16 |
| — | Lembrete de início | "Sua reserva na {espaço} começa às {hora}." | RN16 |

## 8. Telas que o agente deve desenhar para cada mensagem de erro

Cada erro de validação aparece em **dois lugares**: junto ao campo (texto curto) e, quando bloqueia
a ação, em aviso em linha no topo do formulário. O foco vai para o primeiro campo com erro.
