# Escopo: Segmento Social e Sustentável do Hubbi (ODS)

Material para a apresentação. Cada item aponta para a spec ([spec.md](spec.md): US8 a US10,
RN19–RN23, FR-022–FR-026, SC-010–SC-012). Nada aqui cria módulo novo: tudo reaproveita planos,
espaços, reservas e relatórios.

## 1. Proposta em uma frase

> O Hubbi coloca **o espaço certo ao alcance de quem hoje fica de fora** e **premia o uso
> responsável**, com cada impacto medido por dados que o próprio sistema registra.

## 2. ODS escolhidos e a ligação com o produto

| ODS | Meta (paráfrase)* | O que o Hubbi faz | Onde na spec |
|-----|-------------------|-------------------|--------------|
| **8** Trabalho decente e crescimento econômico | 8.3: apoiar empreendedorismo, micro e pequenos negócios | **Plano Social** com desconto para estudantes, microempreendedores e organizações sem fins lucrativos | RN19, FR-022 |
| **10** Redução das desigualdades | 10.2: promover a inclusão social e econômica de todos | Tarifa reduzida por elegibilidade e **acessibilidade de cada espaço** com filtro na busca | RN19, RN20, FR-023 |
| **11** Cidades e comunidades sustentáveis | 11.3: urbanização inclusiva e sustentável | Espaço compartilhado no lugar de sala ociosa; **chegada limpa** (a pé, bicicleta, transporte público, carona, elétrico) premiada | RN20, RN23 |
| **12** Consumo e produção responsáveis | 12.2: uso eficiente dos recursos | **Pontos verdes** por comparecer e evitar no-show; relatório mede a **capacidade perdida** | RN21, RN22 |

\* Confirme o texto oficial das metas em [brasil.un.org/pt-br/sdgs](https://brasil.un.org/pt-br/sdgs)
antes de colocar no slide.

**Foco recomendado**: ODS 8 e 10 como principais (impacto social), 11 e 12 como secundários
(sustentabilidade). Quatro é o limite para não parecer "ODS de enfeite".

## 3. O que entra na v1

### 3.1 Plano Social (US8)
O administrador marca um plano como social e define as categorias. A equipe valida a elegibilidade
e registra categoria, data e responsável. **O sistema não guarda comprovante** (LGPD). O preço
segue a fórmula normal (RN02).

### 3.2 Espaço certo para cada necessidade (US9)
Cada espaço descreve suas características, e a busca filtra por elas junto com o horário livre.

| Grupo | Exemplos | Filtro |
|-------|----------|--------|
| Números | Lugares, tomadas, computadores, internet (Mbps contratados) | Mínimo |
| Ambiente | Ar-condicionado, ventilação natural, luz natural, silencioso | Itens |
| Equipamentos | Quadro branco, TV, projetor, videoconferência, monitor extra | Itens |
| Acessibilidade | Acesso sem degraus, banheiro adaptado, piso tátil | Itens |
| Práticas sustentáveis | LED, coleta seletiva, sem descartáveis | Itens |

**Atalhos de necessidade** preenchem os filtros com um toque: Reunião de equipe, Foco individual,
Desenvolvimento, Criativo e marketing. Exemplo de contraste: marketing escolhe quadro branco, TV e
luz natural; desenvolvimento escolhe 6 tomadas ou mais, internet de 200 Mbps ou mais e monitor
extra. Sem resultado, o sistema aponta o filtro que mais restringiu.

A internet é velocidade **contratada e cadastrada**, não medida (conectividade como métrica
continua fora do escopo).

### 3.3 Hubbi Verde: pontos por uso responsável (US10)

| Ação | Pontos (padrão) |
|------|-----------------|
| Reserva concluída | +10 |
| 5 concluídas seguidas, sem no-show nem multa | +20 de bônus |
| Chegada limpa confirmada pela recepção | +5 (1 vez por dia) |
| No-show | 0 e reinicia a sequência |
| Cancelar | 0 (evita acumular reservando e cancelando) |

**Resgate:** 100 pontos dão 10% de abatimento sobre o valor da reserva, um por reserva, visível
antes de confirmar e congelado na reserva (RN06). Pontos vencem em 12 meses, não valem dinheiro e
não são transferíveis.

**Diferença para um check-in por QR Code:** os pontos vêm de eventos que o sistema já registra
(conclusão, no-show, multa). Não dependem de hardware nem de declaração sem conferência, e o meio
de chegada só conta depois que a recepção confirma. Funciona para quem não anda de bicicleta.

### 3.4 Relatório de impacto (RN21)

| # | Indicador | ODS |
|---|-----------|-----|
| a | Horas de espaço reservadas e concluídas | 11, 12 |
| b | Ocupação por espaço | 12 |
| c | Capacidade perdida (expiradas, canceladas na faixa de multa, no-show) ÷ horas reservadas | 12 |
| d | Clientes em plano social e horas que reservaram | 8, 10 |
| e | Desconto social concedido (R$) | 8, 10 |
| f | Espaços com acessibilidade e reservas neles | 10, 11 |
| g | Horas liberadas por cancelamento antecipado; pontos concedidos e resgatados | 12 |
| h | Chegadas confirmadas por meio de transporte | 11 |

## 4. O que fica de fora (diga isto na apresentação)

- Parcerias com ONGs, doações e eventos comunitários (Constituição, princípio I).
- Cálculo de pegada de carbono, economia de energia ou "árvores salvas": exigiria dados que o
  sistema não coleta e números que não conseguiríamos sustentar.
- QR Code de entrada e qualquer controle de acesso físico.
- Selos e certificações; documentos de elegibilidade dentro do sistema.
- Medição real de internet.

Falar do que **não** entra mostra maturidade e evita perguntas sem resposta da banca.

## 5. Roteiro sugerido de slides (4 a 5 slides)

| Slide | Conteúdo | Fala curta |
|-------|----------|------------|
| 1. Problema | Coworking é caro para estudante, MEI e ONG; salas ociosas; difícil achar o espaço certo | "Espaço sobrando de um lado, gente sem espaço do outro." |
| 2. ODS | Tabela da seção 2 com os ícones oficiais dos ODS 8, 10, 11 e 12 | "Escolhemos quatro ODS que o produto realmente move." |
| 3. Espaço certo | Prints da busca com filtros e atalhos (marketing × desenvolvimento) | "Cada equipe acha a sala com o que precisa em segundos." |
| 4. Hubbi Verde | Tabela de pontos e o resgate | "Premiamos quem usa bem o espaço, e cada ponto é rastreável." |
| 5. Medimos | Oito indicadores e os limites da seção 4 | "Medimos o que registramos; não prometemos o que não dá para provar." |

Os ícones oficiais dos ODS ficam em [brasil.un.org/pt-br/sdgs](https://brasil.un.org/pt-br/sdgs);
siga as regras de uso de marca da ONU.

## 6. Exemplo para o protótipo e a demonstração

Dados fictícios, no padrão do [data-model.md](data-model.md):

- Plano **Social Estudante**: 30% de desconto, R$ 60,00, 30 dias (exemplo ajustável). A cliente
  fictícia **Diana Alves** (estudante) o contrata; a recepção valida e registra o pagamento.
- Diana reserva a Mesa 12 por 2 h: cheio R$ 30,00, paga R$ 21,00 com o plano; o desconto social
  de R$ 9,00 entra no indicador (e).
- Diana tem 100 pontos e resgata: 10% sobre R$ 21,00 = abatimento de R$ 2,10, total R$ 18,90.
- Busca "Desenvolvimento" na terça às 14h: aparece a Estação Norte (12 tomadas, 500 Mbps), e a
  Sala Aurora fica de fora por não ter monitor extra.

## 7. Pendências antes de apresentar

1. **Revisor** para as versões 0.4 e 0.5 (mudam regra de negócio; ver
   [design-brief-versioning.md](contracts/design-brief-versioning.md)).
2. As telas novas ainda **não** constam em [screen-inventory.md](contracts/screen-inventory.md),
   [fluxos.md](fluxos.md) nem no briefing de design. Elas estendem F02, F06, F07, F08 e F11.
3. Confirmar os valores de exemplo: percentual do Plano Social, pontos, 10% de abatimento e
   atalhos de necessidade.
4. Risco financeiro do abatimento verde: com 10% por 100 pontos, o cliente que só conclui
   reservas precisa de 8 reservas seguidas (80 pontos + 20 de bônus) para um resgate. Se a banca perguntar, esse é o
   argumento do custo controlado.
