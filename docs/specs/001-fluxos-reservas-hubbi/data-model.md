# Data Model: Conteúdo e Estados que a Interface Exibe

Modelo de **conteúdo** para o agente de design: que campos cada objeto mostra, quais estados
existem e como cada estado aparece. Não descreve banco de dados. As regras vêm da
[spec](spec.md); aqui só se cita o código (RNxx).

## 1. Objetos e campos exibidos

### Cliente
| Campo | Obrigatório | Validação visível | Regra |
|-------|:-----------:|-------------------|-------|
| Nome | Sim | Texto, até 100 caracteres | — |
| E-mail | Sim | Formato de e-mail; único | RN14 |
| Documento | Sim | Formato válido; único | RN14 |
| Telefone | Sim | Formato com DDD | — |
| Senha | Sim (cadastro) | Mínimo de 8 caracteres, com letra e número; nunca exibida | FR-019 |
| Situação | — | Ativo, Inativo, Anonimizado | RN15 |
| Tipo derivado | — | Avulso, Membro, Membro com pendência | RN13 |

"Membro com pendência" é um estado derivado: plano ativo **e** cobrança vencida. Nele, o preço é
cheio e a reserva nasce pendente (RN13). A interface mostra um aviso, não um novo tipo de conta.

### Espaço
Nome, tipo (sala, mesa, estação), capacidade (pessoas), andar ou local, preço por hora,
horário de funcionamento por dia (padrão 07h–22h, segunda a sábado), duração mínima (padrão 1h),
duração máxima (padrão 8h), passo de agendamento (padrão 30 min), situação (Ativo, Inativo),
e as características da RN20 (todas opcionais; vazio aparece como "não informado"):

| Grupo | Campos | Tipo |
|-------|--------|------|
| Números | Lugares (= capacidade), tomadas, computadores disponíveis, internet (Mbps contratados) | Inteiros ≥ 0 |
| Ambiente | Ar-condicionado, ventilação natural, luz natural, ambiente silencioso | Seleção múltipla |
| Equipamentos | Quadro branco, TV ou tela, projetor, videoconferência, monitor extra, impressora, cabo de rede | Seleção múltipla |
| Acessibilidade | Acesso sem degraus, banheiro adaptado, piso tátil, vaga reservada, intérprete sob pedido | Seleção múltipla |
| Práticas sustentáveis | Iluminação LED, coleta seletiva, sem descartáveis, energia eficiente | Seleção múltipla |

**Atalhos de necessidade** (definidos pelo administrador): nome + combinação de filtros. Exemplos:
Reunião de equipe (lugares ≥ 6, TV ou tela, quadro branco); Foco individual (ambiente silencioso,
lugares = 1); Desenvolvimento (tomadas ≥ 6, internet ≥ 200 Mbps, monitor extra); Criativo e
marketing (quadro branco, TV ou tela, luz natural).
Regras: RN01, RN04, RN05, RN15, RN20. A internet é dado cadastrado, não medido. Mesa hot-desk é espaço de capacidade 1.

### Plano e Assinatura
- **Plano**: nome, desconto (%), preço fixo (R$), duração em dias, situação (Ativo, Inativo),
  plano social (sim/não) e, se social, categorias de elegibilidade (RN19).
- **Elegibilidade social** (na assinatura de plano social): categoria, data da validação e
  responsável. Nenhum documento comprobatório é anexado ou guardado (RN19, FR-019).
- **Assinatura**: cliente, plano, início, vencimento, situação (Solicitada, Ativa, Vencida,
  Cancelada). "Solicitada" é a assinatura pedida pelo cliente que aguarda o pagamento. Regras:
  RN13 e as clarificações de 2026-10-06.

### Reserva
Código, cliente, espaço, data, início, fim, duração, **valor cheio, desconto aplicado (%), plano
vigente na criação, abatimento verde (pontos usados e %) e valor final (congelados, RN06)**,
meio de chegada (informado pelo cliente; confirmado pela recepção, RN23), estado, histórico de estados (data, hora,
responsável, RN09), cobrança vinculada.

### Pagamento ou Cobrança
Código, cliente, vínculo (reserva ou plano), tipo (Reserva, Plano, Multa, Estorno), valor devido,
valor pago, forma de pagamento, data, situação (Pendente, Realizado, Estornado), justificativa
(obrigatória em pagamento parcial). Regras: RN11, RN12.

### Notificação
Tipo (reserva criada, confirmada, cancelada, expirada, lembrete de início, plano perto de
vencer, boas-vindas), título, texto, data e hora, lida ou não lida. Regra: RN16.

### Pontos verdes (extrato)
Saldo e lançamentos: data, tipo (Conclusão +10, Sequência +20, Chegada limpa +5, Resgate −100,
Devolução, Vencimento, Zeragem por anonimização), reserva ligada e saldo após o lançamento.
Pontos vencem em 12 meses. Regras: RN22, RN23. Valores são padrões ajustáveis.

### Usuário da Equipe
Nome, e-mail, perfil (Recepção, Administrador), situação (Ativo, Desativado). Regra: RN17.

## 2. Estados da reserva e como aparecem

Rótulos e cores vêm do [design-system.md](contracts/design-system.md). Todo estado tem **rótulo +
ícone + cor**, nunca só cor.

| Estado | Rótulo | Papel de cor | Ícone | Final? |
|--------|--------|--------------|-------|:------:|
| Pendente | Aguardando pagamento | Alerta | relógio | Não |
| Confirmada | Confirmada | Sucesso | check | Não |
| Concluída | Concluída | Neutro | check duplo | Sim |
| Cancelada | Cancelada | Erro | fechar | Sim |
| No-show | Não compareceu | Erro (tom neutro) | alerta | Sim |

Transições permitidas (RN08): Pendente→Confirmada, Pendente→Cancelada, Confirmada→Cancelada,
Confirmada→Concluída, Confirmada→No-show. Qualquer outra ação aparece **desabilitada com o motivo
em texto**.

## 3. Ações disponíveis por estado e ator

"✔" ação ativa; "—" ação oculta; "🔒" desabilitada com motivo.

| Ação | Pendente | Confirmada | Concluída | Cancelada | No-show |
|------|:--------:|:----------:|:---------:|:---------:|:-------:|
| Cancelar (cliente) | ✔ | ✔ | 🔒 estado final | 🔒 estado final | 🔒 estado final |
| Cancelar (equipe) | ✔ | ✔ | 🔒 | 🔒 | 🔒 |
| Registrar pagamento (equipe) | ✔ | ✔ se houver cobrança pendente | — | — | ✔ se houver cobrança pendente |
| Concluir ou marcar no-show (equipe) | — | ✔ só após o término; antes, 🔒 "só depois do término" | — | — | — |
| Ver histórico | ✔ | ✔ | ✔ | ✔ | ✔ |
| Excluir | nunca existe (RN09) | | | | |

## 4. Valores derivados exibidos

| Valor | Fórmula (RN) | Onde aparece |
|-------|--------------|--------------|
| Preço da reserva | preço/hora × duração em horas × (1 − desconto) (RN02) | Busca, resumo, detalhe |
| Desconto aplicado | % do plano ativo; 0% para avulso, plano vencido ou cobrança vencida (RN02, RN13) | Resumo, detalhe |
| Multa | 0% se faltam 24h ou mais; 50% entre 24h e 2h; 100% com menos de 2h; 0 para pendente sem pagamento (RN07) | Cancelamento |
| Valor retido | menor valor entre o pago e a multa | Cancelamento |
| Estorno | valor pago − multa, mínimo 0 (RN11) | Cancelamento, pagamentos |
| Saldo de multa pendente | multa − valor pago, quando positivo (RN07) | Cancelamento, pagamentos |
| Prazo de pagamento | menor valor entre 2h após a criação e 1h antes do início (RN12) | Detalhe da reserva pendente |
| Abatimento verde | 10% do valor da RN02 quando o cliente resgata 100 pontos; um por reserva (RN22) | Resumo, detalhe |
| Valor final | valor da RN02 − abatimento verde (RN06, RN22) | Resumo, detalhe |
| Saldo de pontos | soma dos lançamentos não vencidos do extrato (RN22) | Portal (Hubbi Verde), resumo de reserva |
| Receita | pagamentos Realizados − estornos (RN18) | Relatório de pagamentos |
| Capacidade perdida | horas de reservas expiradas, canceladas na faixa de multa ou no-show ÷ horas reservadas (RN21) | Relatório de impacto |
| Desconto social concedido | soma de (valor cheio − valor final) das reservas de membros de plano social (RN06, RN21) | Relatório de impacto |
| Horas reservadas, ocupação, clientes em plano social, reservas em espaços acessíveis | contagens dos registros do período (RN21 a, b, d, f) | Relatório de impacto |
| Horas liberadas por cancelamento antecipado | horas de reservas canceladas sem multa (24h ou mais) (RN21 g) | Relatório de impacto |
| Pontos concedidos e resgatados; chegadas por meio de transporte | contagens do extrato e dos meios confirmados (RN21 g, h) | Relatório de impacto |

Arredondamento: valores em reais com 2 casas, meio para cima. O protótipo usa números redondos de
exemplo.

## 5. Dados de exemplo para o protótipo

| Item | Exemplo |
|------|---------|
| Espaços | Sala Aurora (sala de reunião, 8 pessoas, 3º andar, R$ 80,00/h; 8 tomadas, 300 Mbps, TV, quadro branco, luz natural, acesso sem degraus); Mesa 12 (hot-desk, 1 pessoa, 2º andar, R$ 15,00/h; 2 tomadas, 100 Mbps, ambiente silencioso, acesso sem degraus); Estação Norte (estação, 4 pessoas, 2º andar, R$ 40,00/h; 12 tomadas, 500 Mbps, 4 computadores, monitor extra, ventilação natural) |
| Planos | Essencial (10%, R$ 120,00, 30 dias); Profissional (20%, R$ 250,00, 30 dias); Equipe (30%, R$ 480,00, 30 dias) |
| Clientes | Ana Souza (Membro, Profissional); Bruno Lima (Avulso); Carla Dias (Membro com pendência) |
| Reserva de exemplo | Sala Aurora, 2 h → cheio R$ 160,00; Ana (20%) paga R$ 128,00; Bruno paga R$ 160,00 |
| Multa de exemplo | Reserva de R$ 160,00 paga: com 24h ou mais, sem multa; entre 24h e 2h, retém R$ 80,00 e estorna R$ 80,00; com menos de 2h, retém R$ 160,00 |
| Equipe | Marina (Administradora), Paulo (Recepção) |

Todos os dados são fictícios e não devem conter pessoas reais.
