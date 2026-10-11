# Roteiro de apresentação do Hubbi

Duração: **cerca de 11 minutos**, mais perguntas. Mostra o site funcionando; a tecnologia não é
tema (PRD, decisão D6). Os valores abaixo foram conferidos com os dados de exemplo; as datas são
relativas a "hoje", então confira os dias na tela.

## 1. Antes de entrar na sala

- [ ] Abrir o site publicado (ou `npm run dev`, `http://localhost:5173`) no navegador que vai
      usar, **com a barra "Estados do protótipo" visível** (`VITE_SHOW_PROTO` não pode ser `false`).
- [ ] Zoom do navegador em 100% e janela grande. Para mostrar o celular: menu de visualização do
      navegador em 390 × 844.
- [ ] Ir a `/login`. Se aparecer a conta de alguém, clicar em **Sair da conta**.
- [ ] **Restaurar os dados de exemplo:** entrar com a conta de exemplo, abrir **Meu plano** e
      clicar em **Restaurar dados de exemplo** na barra. Sempre que ensaiar, repita isso.
- [ ] Deixar uma segunda aba aberta em `/impact?period=all` (plano B para o final).
- [ ] Ensaiar uma vez com cronômetro.

**Dados para o cadastro da conta nova** (passo 7; CPF válido de teste, não é de ninguém):

| Campo | Valor |
|-------|-------|
| Nome | Marina Costa |
| CPF | 111.444.777-35 |
| Celular | (11) 98888-7777 |
| E-mail | marina@email.com |
| Senha | reserva2026 |

## 2. Mapa do tempo

| # | Parte | Tela | Tempo |
|---|-------|------|------:|
| 1 | Abertura | Landing | 1 min |
| 2 | Preço claro e escolha pela necessidade | Landing (simulador e atalhos) | 1 min 30 |
| 3 | Entrar e ver o dia | Login, Início | 1 min |
| 4 | Encontrar o espaço certo | Espaços | 1 min 30 |
| 5 | Reservar com preço à vista | Resumo, Reserva feita | 1 min 30 |
| 6 | Cancelar sabendo a multa | Minhas reservas, Detalhe | 1 min 30 |
| 7 | Plano Social | Cadastro, Meu plano | 1 min 15 |
| 8 | Hubbi Verde | Hubbi Verde | 1 min |
| 9 | Nosso impacto e fecho | Nosso impacto | 1 min |

**Regra de ouro:** a barra escura embaixo da tela simula a recepção e a gerência. Avise isso na
abertura e diga "agora a recepção…" toda vez que clicar nela. No sistema completo, isso é um
painel da equipe, que ficou para a próxima versão.

## 3. Passo a passo

### 1. Abertura (landing, 1 min)

**Mostre** a página inicial, sem clicar em nada.

**Fale:**
- "O Hubbi é um sistema de reserva de salas e mesas de coworking. Resolve três problemas:
  reserva sem controle, espaço difícil de achar e acesso desigual."
- "Hoje vou mostrar o caminho de quem usa: encontrar o espaço, reservar, cancelar, assinar um
  plano e ganhar pontos por usar bem. Tudo que a recepção faz aparece nesta barra escura."

### 2. Preço claro e escolha pela necessidade (landing, 1 min 30)

1. Na demonstração do topo, clicar no atalho **Desenvolvimento**. Aparece só a **Estação Norte**.
   - **Fale:** "Cada equipe precisa de uma coisa. Desenvolvimento quer tomada e internet rápida; o
     atalho filtra por 6 tomadas ou mais, 200 Mbps ou mais e monitor extra." (RN20)
2. Descer até **Simule e veja quanto sua reserva custa**. Deixar Sala Aurora, 2 h, plano
   Profissional: **R$ 128,00**. Ligar **Usar 100 pontos verdes**: **R$ 115,20**.
   - **Fale:** "Preço por hora vezes as horas, menos o desconto do plano. O valor sempre aparece
     antes de confirmar, e a multa de cancelamento também." (RN02, RN06)

### 3. Entrar e ver o dia (login e início, 1 min)

1. Clicar em **Entrar**. Na tela de login, clicar em **Entrar com a conta de exemplo**.
   - **Fale:** "O sistema não tem servidor. Os dados ficam no navegador e esta conta de exemplo
     serve para a demonstração."
2. Na tela inicial, apontar: **Sala Aurora, amanhã, R$ 128,00 com 20% do plano**, o plano
   Profissional e os **140 pontos verdes**.
   - **Fale:** "A Ana é membro do plano Profissional. A próxima reserva dela já aparece no
     destaque."

### 4. Encontrar o espaço certo (Espaços, 1 min 30)

1. Menu **Espaços**. Mostrar a busca: data, início, duração, tipo.
   - **Fale:** "A Sala Aurora não aparece como livre, porque a Ana já a reservou nesse horário.
     Não existem duas reservas no mesmo espaço e horário." (RN03)
2. Clicar no atalho **Desenvolvimento**. Fica só a **Estação Norte**. Clicar de novo para limpar.
3. Abrir **Filtros**, marcar **Projetor**: aparece "Nenhum espaço tem tudo isso", dizendo qual
   filtro limitou e com botão para remover.
   - **Fale:** "O filtro combina tudo ao mesmo tempo, e quando não sobra nada, o sistema diz o
     que atrapalhou." Remover o filtro.

### 5. Reservar com preço à vista (Resumo e Reserva feita, 1 min 30)

1. Na **Sala Esmeralda** (R$ 152,00, cheio R$ 190,00), clicar em **Reservar**.
2. No resumo: ligar **Usar 100 pontos verdes** e escolher **Bicicleta** em "Como você vai chegar?".
   Os valores ficam: cheio R$ 190,00, plano − R$ 38,00, pontos − R$ 15,20, **total R$ 136,80**.
   - **Fale:** "Tudo está na tela antes de confirmar, inclusive o que acontece se cancelar. O valor
     é gravado e não muda mais." (RN06)
3. Clicar em **Confirmar reserva · R$ 136,80**. Aparece **Reserva confirmada**, porque a Ana é
   membro; um cliente avulso veria "Aguardando pagamento" com prazo para pagar. (RN12, RN13)

### 6. Cancelar sabendo a multa (Minhas reservas e Detalhe, 1 min 30)

1. Menu **Minhas reservas**: mostrar as abas **Próximas, Passadas, Canceladas**.
2. Abrir a **Sala Aurora** (**Detalhes**). Mostrar valores gravados e linha do tempo.
3. Na barra: **Recepção registra pagamento** (vira "Pago · R$ 128,00") e depois
   **Simular: faltam 5 h para o início**.
4. Clicar em **Cancelar reserva**. O painel mostra: **multa de 50%, R$ 64,00, estorno R$ 64,00**,
   com o botão **Cancelar e reter R$ 64,00**.
   - **Fale:** "Com 24 horas ou mais, não há multa. Entre 24 e 2 horas, 50%. Com menos de 2
     horas, 100%. A pessoa vê o valor antes de confirmar." (RN07, RN11)
5. Clicar em **Voltar** (não precisa cancelar). Se sobrar tempo: abrir a **Estação Norte**,
   **Simular: faltam 90 min** e mostrar a multa de 100% sem pagamento (R$ 128,00 em cobrança
   pendente). Cuidado: cancelar de verdade muda os números do final.

### 7. Plano Social (cadastro e Meu plano, 1 min 15)

1. Clicar em **Sair da conta** (menu lateral) e depois em **Criar conta grátis**.
2. Mostrar, sem preencher, o botão **Criar minha conta**: os erros por campo e o resumo no topo.
   Depois preencher com os dados da Marina (seção 1). As regras da senha ficam verdes.
3. Em **Conta criada**, clicar em **Ir para o início**, depois **Meu plano**. Em **Social**,
   clicar em **Pedir o Plano Social**, escolher **Estudante**, escrever uma observação curta e
   **Enviar solicitação**.
   - **Fale:** "Para estudantes, microempreendedores e ONGs, 30% de desconto por R$ 60,00. A
     gerência analisa o pedido antes do pagamento; ninguém guarda o comprovante." (RN19)
4. Na barra: **Gerência aprova o Plano Social**, depois **Recepção registra pagamento de
   R$ 60,00**. O plano fica **ativo**.
5. Em **Espaços**, mostrar o preço com **30% do plano Social**.

### 8. Hubbi Verde (1 min)

Entrar de novo como Ana: **Sair da conta** e **Entrar com a conta de exemplo**.

1. Menu **Hubbi Verde**. Mostrar o saldo, o extrato com o **−100** do resgate da reserva do
   passo 5 e a sequência sem falta.
2. Na barra: **Recepção confirma chegada: Estação Sul (de bicicleta)**. O toast diz
   "Reserva concluída: +10 pontos. Chegada limpa confirmada: +5 pontos."
   - **Fale:** "Os pontos vêm de coisas que o sistema registra: comparecer, não faltar e chegar de
     forma mais limpa, confirmado pela recepção. Cancelar não dá ponto, para ninguém acumular
     reservando e cancelando." (RN22, RN23)

### 9. Nosso impacto e fecho (1 min)

1. Menu da landing ou rodapé: **Nosso impacto** (`/impact`). Mostrar o período e os cards.
   - **Fale:** "Oito indicadores calculados de dados reais do sistema: horas usadas, capacidade
     perdida por falta ou cancelamento tardio, Plano Social, desconto concedido, acessibilidade,
     pontos e como as pessoas chegam. Ninguém aparece, só totais." (RN21)
2. Descer até **Como calculamos**: "Não estimamos carbono nem renda gerada, porque não temos
   dados para sustentar esses números."
3. **Fecho:** "Reserva com preço claro, escolha pela necessidade, plano social e pontos por uso
   responsável, ligados aos ODS 8, 10, 11 e 12."

## 4. Se algo der errado

| Problema | O que fazer |
|----------|-------------|
| Algo estranho nos dados ou numa conta | Barra do protótipo: **Restaurar dados de exemplo** |
| Esqueceu uma etapa e a tela mudou | Menu lateral; os dados são mantidos |
| Site fora do ar | Rodar `npm run dev` no notebook (deixe pronto antes) |
| Aviso "este navegador não permite salvar dados" | Sair de janela anônima; sem isso, os dados somem ao recarregar |
| Fontes diferentes sem internet | Segue funcionando com as fontes do sistema; avise que é a internet |
| Nada funciona no final | Mostrar `/impact?period=all` na segunda aba e fechar falando |

## 5. Perguntas prováveis e respostas

| Pergunta | Resposta |
|----------|----------|
| Onde ficam os dados? | No navegador de quem usa. É um protótipo sem servidor; cada computador tem os próprios dados. |
| E o pagamento? | Sempre registrado manualmente pela recepção, como pede a constituição do projeto. Não há gateway nesta versão. |
| Cadê o painel da recepção? | Ficou para a próxima versão. Na demonstração, a barra escura simula o que a recepção faria. |
| Como evita duas reservas no mesmo horário? | O sistema confere de novo na hora de confirmar. Mostramos isso no resumo com "Esse horário já foi reservado". |
| Um cliente vê dados de outro? | Não. Cada conta vê só as próprias reservas; abrir a reserva de outra conta mostra "não encontramos". |
| A senha fica guardada? | Só como hash com sal; a senha em texto nunca é gravada. |
| Como garantem o Plano Social sem guardar documento? | A gerência confere fora do sistema; o sistema guarda só categoria e uma observação curta, por causa da LGPD. |
| Os números de impacto são confiáveis? | Cada um sai de reservas, planos e pontos registrados e se confere à mão. Não estimamos carbono. |
| O que ainda não está definido? | Revisor das regras novas (Plano Social, indicadores), a regra do prazo de pagamento fora do horário da recepção e o mapa do andar. |

## 6. Cuidados de hoje

- **Horário da apresentação:** o prazo de pagamento de reserva avulsa é de até 2 horas (RN12). À
  noite, ele cai de madrugada, com a recepção fechada. É uma dúvida em aberto sobre a regra; se
  perguntarem, diga isso.
- **Fim de semana:** a busca padrão pula para o próximo dia útil (segunda a sábado).
- **Não cancele de verdade** a reserva da Sala Aurora antes do passo 9 sem querer: isso muda
  "horas liberadas cedo" no impacto.
