# Fluxos do Hubbi (Mermaid)

Diagramas dos fluxos F01 a F12 da [spec](spec.md). Cada diagrama cita as regras (RN) e os
requisitos (FR) que realiza, conforme o princípio V da constituição. Valores como horário, multas
e prazos são os padrões da spec.

Legenda: retângulo = ação; losango = decisão; arredondado = início ou fim; paralelogramo-texto
`[/ /]` = tela ou mensagem ao usuário.

---

## Ciclo de vida da reserva (RN08, RN09, FR-006)

```mermaid
stateDiagram-v2
    [*] --> Pendente: cliente avulso reserva (RN12)
    [*] --> Confirmada: membro reserva (RN13)
    Pendente --> Confirmada: pagamento integral registrado
    Pendente --> Cancelada: expirou sem pagamento (RN12)
    Pendente --> Cancelada: cliente ou equipe cancela, sem multa (RN07)
    Confirmada --> Cancelada: cancelamento com multa conforme prazo (RN07)
    Confirmada --> Concluida: equipe marca presença após o término (RN10)
    Confirmada --> NoShow: equipe marca ausência após o término (RN10)
    Concluida --> [*]
    Cancelada --> [*]
    NoShow --> [*]
    note right of Pendente
        Toda transição grava data, hora
        e responsável no histórico (RN09)
    end note
```

---

## F01 — Cadastro e login (US4, RN14, RN17, FR-001, FR-002, FR-019)

```mermaid
flowchart TD
    A([Visitante abre o portal]) --> B{Já tem conta?}
    B -- Não --> C[/Tela de cadastro: nome, e-mail, documento, telefone, senha/]
    C --> D{Dados válidos?}
    D -- Não --> C1[/Erro de validação claro no campo/] --> C
    D -- Sim --> E{E-mail ou documento já cadastrado?}
    E -- Sim --> E1[/Já existe conta: entrar ou recuperar senha/] --> F
    E -- Não --> G[Cria cliente avulso, senha salva como hash]
    G --> H[/Notificação de boas-vindas/]
    H --> I([Portal do cliente])
    B -- Sim --> F[/Tela de login/]
    F --> J{Credenciais corretas?}
    J -- Não --> J1[/Mensagem genérica de erro, sem revelar qual campo/] --> F
    J -- Sim --> K{Perfil}
    K -- Cliente --> I
    K -- Recepção ou Administrador --> L([Painel da equipe])
```

---

## F02 — Consultar disponibilidade e preço (US1, RN01, RN02, RN06, FR-003)

```mermaid
flowchart TD
    A([Cliente ou recepção abre Espaços]) --> B[/Filtros: data, horário, duração, tipo de espaço/]
    B --> C[Lista apenas espaços ativos com horário livre]
    C --> D{Há espaços livres?}
    D -- Não --> D1[/Nenhum espaço livre: sugere outros horários/] --> B
    D -- Sim --> E[Calcula preço por espaço]
    E --> F{Cliente tem plano ativo e nenhuma cobrança vencida? RN13}
    F -- Sim --> G[/Mostra preço cheio riscado e preço com desconto do plano/]
    F -- Não --> H[/Mostra preço cheio. Se há cobrança vencida, avisa que o desconto está suspenso/]
    G --> I([Seleciona espaço e segue para F03])
    H --> I
```

---

## F03 — Criar reserva (US1, RN01 a RN06, RN12, RN13, FR-004, FR-005)

```mermaid
flowchart TD
    A([Espaço e período escolhidos]) --> A1{Quem reserva?}
    A1 -- Cliente no portal --> A2{Início com 1h ou mais de antecedência? RN12}
    A2 -- Não --> X0[/Antecedência mínima de 1h: escolha outro horário/] --> Z([Volta para F02])
    A2 -- Sim --> B
    A1 -- Recepção --> B{Espaço ativo?}
    B -- Não --> X1[/Espaço indisponível/] --> Z
    B -- Sim --> C{Dentro do horário de funcionamento, no mesmo dia?}
    C -- Não --> X2[/Fora do horário: mostra horário do dia/] --> Z
    C -- Sim --> D{Duração entre mínimo e máximo e múltipla do passo?}
    D -- Não --> X3[/Duração inválida: mostra limites/] --> Z
    D -- Sim --> E{Algum conflito com reserva pendente ou confirmada?}
    E -- Sim --> X4[/Horário ocupado: sugere horários livres/] --> Z
    E -- Não --> F[Calcula preço: hora x duração x 1 menos desconto. Desconto 0% para avulso ou cobrança vencida]
    F --> G[/Resumo da reserva com valor final/]
    G --> H{Cliente confirma?}
    H -- Não --> Z1([Cancela o fluxo, nada é gravado])
    H -- Sim --> I[Revalida conflito no momento de gravar]
    I --> J{Ainda livre?}
    J -- Não --> X4
    J -- Sim --> K[Grava reserva com valor cheio, desconto, plano e valor final]
    K --> L{Cliente tem plano ativo e nenhuma cobrança vencida? RN13}
    L -- Sim --> M[Estado Confirmada + cobrança pendente]
    L -- Não --> L1{Recepção reservando com menos de 1h e registrando pagamento integral no ato?}
    L1 -- Sim --> M1[Estado Confirmada, pagamento Realizado]
    L1 -- Não --> N[Estado Pendente, prazo de pagamento começa]
    M --> O[Registra histórico + notificação]
    M1 --> O
    N --> O
    O --> P([Comprovante de reserva exibido])
```

---

## F04 — Pagar e confirmar reserva, registro manual (US2, RN11, RN12, FR-009)

```mermaid
flowchart TD
    A([Recepção abre Pagamentos pendentes]) --> B[/Lista: cliente, reserva ou plano, valor devido, prazo/]
    B --> C[Seleciona cobrança]
    C --> D[/Informa valor, forma de pagamento e data/]
    D --> E{Valor igual ao devido?}
    E -- Maior que o devido --> E1[/Recusado: valor excede o devido/] --> D
    E -- Menor --> F[Registra pagamento parcial com justificativa]
    F --> F1[/Cobrança segue pendente/] --> Z([Fim])
    E -- Igual --> G[Pagamento fica Realizado]
    G --> H{Cobrança é de reserva Pendente?}
    H -- Sim --> I[Reserva passa a Confirmada, grava histórico]
    H -- Não, é de plano ou de reserva de membro --> J[Atualiza situação da cobrança]
    I --> K[/Notificação de confirmação ao cliente/]
    J --> K
    K --> Z
```

---

## F05 — Cancelar reserva com multa e estorno (US3, RN07, RN08, RN11, FR-007)

```mermaid
flowchart TD
    A([Cliente ou equipe abre a reserva]) --> B{Estado é Pendente ou Confirmada?}
    B -- Não --> X[/Cancelamento não permitido neste estado/] --> Z([Fim])
    B -- Sim --> C{Reserva está Pendente sem pagamento?}
    C -- Sim --> D[Multa 0 e estorno 0]
    C -- Não --> E{Quanto falta para o início?}
    E -- "24h ou mais" --> F[Multa 0%]
    E -- "entre 24h e 2h" --> G[Multa 50% do valor]
    E -- "menos de 2h" --> H[Multa 100% do valor]
    F --> I[Estorno = valor pago menos multa, mínimo 0]
    G --> I
    H --> I
    D --> J[/Tela mostra multa, valor retido e estorno antes de confirmar/]
    I --> J
    J --> K{Confirma o cancelamento?}
    K -- Não --> Z
    K -- Sim --> L[Estado Cancelada, horário liberado, histórico gravado. Cobrança original cancelada]
    L --> M{Multa maior que o valor já pago?}
    M -- Sim, inclui reserva de membro sem pagamento --> M1[Valor pago retido como multa e saldo vira cobrança de multa Pendente, estorno 0]
    M -- Não --> M2{Sobra valor pago a devolver?}
    M2 -- Sim --> N[Gera estorno pendente para a equipe registrar como Estornado]
    M2 -- Não --> O[Sem movimentação financeira]
    M1 --> P[/Notificação com multa e estorno/]
    N --> P
    O --> P
    P --> Z
```

---

## F06 — Encerrar reserva: concluída ou no-show (US2, RN08, RN10, FR-010)

```mermaid
flowchart TD
    A([Recepção abre Reservas do dia]) --> B[/Lista de reservas Confirmadas/]
    B --> C{Horário de término já passou?}
    C -- Não --> X[/Ainda não é possível encerrar/] --> Z([Fim])
    C -- Sim --> D{Cliente compareceu?}
    D -- Sim --> E[Estado Concluída]
    D -- Não --> F[Estado No-show]
    E --> G[Grava histórico com responsável]
    F --> G
    G --> H{Há cobrança ainda pendente?}
    H -- Sim --> I[Cobrança segue em Pagamentos pendentes]
    H -- Não --> J[Nada a cobrar]
    I --> Z
    J --> Z
```

Expiração automática de reservas pendentes (RN12):

```mermaid
flowchart LR
    A[Rotina periódica] --> B{Reserva Pendente passou de 2h ou faltam menos de 1h para o início?}
    B -- Não --> A
    B -- Sim --> C[Estado Cancelada, sem multa]
    C --> D[Horário liberado + histórico automático]
    D --> E[/Notificação de expiração ao cliente/]
```

---

## F07 — Gerir espaços, preços e horários (US5, RN01, RN04, RN05, RN15, FR-012)

```mermaid
flowchart TD
    A([Administrador abre Espaços]) --> B{Ação}
    B -- Cadastrar ou editar --> C[/Formulário: nome, tipo, capacidade, preço por hora, horário, duração mínima e máxima/]
    C --> D{Dados válidos?}
    D -- Não --> D1[/Erro de validação/] --> C
    D -- Sim --> E[Salva espaço]
    E --> F[/Reservas existentes mantêm o valor gravado/]
    B -- Inativar --> G{Há reservas futuras Pendentes ou Confirmadas?}
    G -- Sim --> G1[/Aviso: trate essas reservas antes/] --> H[Lista reservas afetadas para cancelar ou remanejar]
    G -- Não --> I[Espaço inativo: some da busca, permanece nos históricos]
    B -- Consultar --> J[/Lista de espaços e estado/]
    F --> Z([Fim])
    H --> Z
    I --> Z
    J --> Z
```

---

## F08 — Gerir planos e assinatura (US5, US6, RN13, RN16, FR-013)

```mermaid
flowchart TD
    A([Administrador abre Planos]) --> B[/Cadastrar ou editar plano: nome, desconto %, validade, preço/]
    B --> C[Plano salvo, vale apenas para novas reservas]

    D([Cliente solicita no portal ou recepção registra Contratar plano]) --> E{Cliente já tem plano ativo?}
    E -- Sim --> E1[/Apenas um plano ativo: solicitar troca ou cancelamento do atual/] --> F
    E -- Não --> F[Cria assinatura e cobrança do plano pelo preço fixo, Pendente]
    F --> G[Recepção registra pagamento em F04 e efetiva a solicitação]
    G --> H[Assinatura Ativa pela duração em dias: descontos valem nas novas reservas]

    H --> I{Evento}
    I -- Faltam poucos dias --> J[/Aviso de vencimento ao cliente/]
    I -- Venceu --> K[Assinatura Inativa: cliente passa a ser tratado como avulso]
    I -- Cancelamento --> K1[Sem devolução: plano segue até o vencimento pago, só impede a renovação] --> K
    I -- Troca de plano --> L[Nova assinatura passa a valer no próximo vencimento, sem devolução]
    K --> M[Reservas já feitas mantêm o valor gravado]
```

---

## F09 — Gerir clientes (US4, RN14, RN15, RN17, FR-014)

```mermaid
flowchart TD
    A([Recepção abre Clientes]) --> B{Ação}
    B -- Consultar --> C[/Busca por nome, e-mail ou documento + detalhe com plano, reservas e pagamentos/]
    B -- Cadastrar --> D[/Formulário do cliente/]
    B -- Editar --> D
    D --> E{Dados válidos e e-mail ou documento únicos?}
    E -- Não --> E1[/Erro claro/] --> D
    E -- Sim --> F[Salva cliente]
    B -- Inativar ou anonimizar a pedido do titular --> G{Possui reservas futuras ativas?}
    G -- Sim --> G1[/Trate as reservas antes de inativar ou anonimizar/]
    G -- Não --> G2{Ação}
    G2 -- Inativar --> H[Cliente Inativo: histórico preservado, login bloqueado]
    G2 -- Anonimizar --> H1[Dados pessoais anonimizados, cadastro anônimo e inativo, histórico ligado a ele, registra quem fez]
    C --> Z([Fim])
    F --> Z
    G1 --> Z
    H --> Z
    H1 --> Z
```

---

## F10 — Notificações recebidas (US7, RN16, FR-015)

```mermaid
flowchart LR
    subgraph Eventos
        E1[Reserva criada]
        E2[Reserva confirmada]
        E3[Reserva cancelada com multa ou estorno]
        E4[Reserva expirada]
        E5[Lembrete antes do início]
        E6[Plano perto de vencer]
    end
    E1 --> N[Gera notificação ao cliente]
    E2 --> N
    E3 --> N
    E4 --> N
    E5 --> N
    E6 --> N
    N --> P[/Aparece no portal/]
    N --> M[/Enviada por e-mail/]
    P --> L[Cliente marca como lida]
```

---

## F11 — Relatórios (US7, RN18, FR-016)

```mermaid
flowchart TD
    A([Recepção ou administrador abre Relatórios]) --> B[/Escolhe relatório e período/]
    B --> C{Tipo}
    C -- Reservas --> D[Total por estado + histórico detalhado]
    C -- Clientes --> E[Avulsos x membros, novos, inativos]
    C -- Pagamentos --> F[Receita realizada menos estornos, pendentes, multas]
    C -- Ocupação --> G[Horas reservadas por espaço]
    D --> H{Há dados no período?}
    E --> H
    F --> H
    G --> H
    H -- Não --> H1[/Sem dados no período/]
    H -- Sim --> I[/Tabela e totais na tela/]
    I --> J[Exportar opcional]
```

---

## F12 — Gerir usuários da equipe e permissões (RN17, FR-017)

```mermaid
flowchart TD
    A([Administrador abre Equipe]) --> B{Ação}
    B -- Criar usuário --> C[/Nome, e-mail, perfil: Recepção ou Administrador/]
    C --> D{E-mail único e dados válidos?}
    D -- Não --> D1[/Erro de validação/] --> C
    D -- Sim --> E[Cria usuário, senha inicial com troca obrigatória, salva como hash]
    B -- Alterar perfil --> F[Atualiza permissões do usuário]
    B -- Desativar --> G{É o último administrador ativo?}
    G -- Sim --> G1[/Não é possível desativar o último administrador/]
    G -- Não --> H[Usuário desativado, histórico preservado]
```

Matriz de permissões (RN17):

| Ação | Cliente | Recepção | Administrador |
|------|:-------:|:--------:|:-------------:|
| Ver e reservar em seu nome | ✔ | ✔ (para qualquer cliente) | ✔ |
| Ver dados de outros clientes | ✘ | ✔ | ✔ |
| Cancelar a própria reserva | ✔ | ✔ (de qualquer cliente) | ✔ |
| Solicitar contratação, troca ou cancelamento de plano | ✔ (só o próprio) | ✔ (efetiva) | ✔ (efetiva) |
| Registrar pagamento e estorno | ✘ | ✔ | ✔ |
| Encerrar reserva (concluída ou no-show) | ✘ | ✔ | ✔ |
| Cadastrar, editar e inativar clientes | ✘ | ✔ | ✔ |
| Gerir espaços, preços e planos | ✘ | ✘ | ✔ |
| Gerir usuários da equipe | ✘ | ✘ | ✔ |
| Relatórios | ✘ | ✔ | ✔ |
