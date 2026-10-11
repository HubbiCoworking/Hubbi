# TRD: Hubbi, requisitos técnicos do MVP

| Campo | Valor |
|-------|-------|
| Versão do documento | 1.0 (2026-10-10) |
| Documentos irmãos | [PRD](PRD.md) · [design.md](design.md) · [Spec 001](specs/001-fluxos-reservas-hubbi/spec.md) |
| Natureza do MVP | Protótipo navegável que roda no navegador, publicado na web, para demonstração em sala |

> **Escopo deste documento.** Descreve como o MVP do [PRD](PRD.md) é construído. A tecnologia
> é assunto interno da equipe: na apresentação, mostra-se o site, não a stack (decisão D6 do
> PRD). A Constituição pede requisitos independentes de tecnologia; por isso a stack fica só
> aqui, e a spec 001 não muda. Itens marcados **Proposta** são sugestões técnicas que ainda
> precisam do aceite da equipe (seção 12).

## 1. Requisitos técnicos

| ID | Requisito | Origem |
|----|-----------|--------|
| TR-01 | O site roda inteiro no navegador, sem servidor próprio | PRD, decisão D3 |
| TR-02 | Os dados de exemplo e os dados criados na demonstração ficam salvos no navegador e sobrevivem a recarregar a página | PRD, decisão D3 |
| TR-03 | As rotas da URL são em inglês; o texto da interface é em português do Brasil | PRD, decisão D7 |
| TR-04 | Rotas da área logada (`/app/...`) exigem conta; sem sessão, levam ao login e voltam ao destino depois de entrar | FR-002, RN17 |
| TR-05 | Cada conta vê só os próprios dados | RN17, SC-008 |
| TR-06 | Senhas nunca ficam salvas em texto puro | FR-019, Constituição VI |
| TR-07 | As regras de negócio ficam em funções isoladas da interface, uma por regra | Constituição II e V |
| TR-08 | Operações comuns respondem em até 2 s | FR-021, SC-009 |
| TR-09 | Layout responsivo de 360 a 1920 px, sem rolagem horizontal | FR-021 |
| TR-10 | Acessibilidade WCAG 2.2 AA | plan.md, [design.md](design.md) |
| TR-11 | As ações da equipe podem ser simuladas por uma barra de protótipo, que pode ser escondida no site publicado | PRD, seção 6.3 |
| TR-12 | Publicação na Vercel, com cada rota abrindo direto pela URL | PRD, seção 8 |

## 2. Stack

| Camada | Escolha | Situação |
|--------|---------|----------|
| Linguagem | TypeScript 5.6, modo estrito | Em uso |
| Interface | React 18.3 | Em uso |
| Rotas | React Router 6.28 | Em uso |
| Build e servidor local | Vite 5.4 | Em uso |
| Estilos | CSS próprio com variáveis (tokens), sem framework de UI | Em uso |
| Fontes | Google Fonts: Nunito, Inter, Caveat | Em uso |
| Testes das regras | Vitest | **Proposta** (TD5) |
| Hospedagem | Vercel (site estático) | Configurado |
| Ambiente | Node.js 18.18 ou mais novo (testado no 24) | Em uso |

Sem bibliotecas de componentes, estado global ou CSS: o MVP é pequeno e o design system próprio
([design.md](design.md)) cobre o que a interface precisa.

## 3. Arquitetura

Aplicação de página única (SPA) servida como site estático.

```text
Navegador
├── Interface (React)
│   ├── pages/        uma página por rota
│   ├── features/     seções e partes de cada área (landing, auth, portal)
│   └── components/   peças reutilizáveis do design system
├── domain/           regras de negócio puras (RN), sem React        ← Proposta (TD1)
├── store/            leitura e gravação no localStorage, com versão  ← Proposta (TD1)
├── data/             dados de exemplo da spec (espaços, planos, valores)
└── lib/              formatação, validação, movimento
```

Fluxo de dados: a página chama o `store` para ler e gravar, e o `store` usa as funções do
`domain` para calcular preço, multa, transições e pontos. A interface nunca recalcula uma regra
por conta própria.

## 4. Rotas

Rotas em inglês (decisão D7), no padrão usado por produtos como GitHub, Vercel e Notion:
substantivos no plural para coleções, `new` para criar, identificador no caminho e área logada
sob `/app`.

### 4.1 Mapa de rotas

| Rota | Tela | Código | Acesso |
|------|------|--------|--------|
| `/` | Landing page | sem código | Público |
| `/impact` | Nosso impacto | T47 | Público |
| `/signup` | Criar conta | T01 | Só sem sessão |
| `/login` | Entrar | T02 | Só sem sessão |
| `/forgot-password` | Recuperar senha | T03 | Público |
| `/app` | Início do portal | T45 | Com sessão |
| `/app/spaces` | Espaços: busca e lista | T04 | Com sessão |
| `/app/bookings/new` | Resumo da reserva | T07 | Com sessão |
| `/app/bookings/:id/confirmation` | Reserva feita | T08 | Com sessão, dono da reserva |
| `/app/bookings` | Minhas reservas | T11 | Com sessão |
| `/app/bookings/:id` | Detalhe e cancelamento | T12, T18 | Com sessão, dono da reserva |
| `/app/plan` | Meu plano e solicitar plano | T28, T29 | Com sessão |
| `/app/rewards` | Hubbi Verde: saldo e extrato | T46 | Com sessão |
| `*` | Página não encontrada | sem código | Público |

"Só sem sessão": quem já entrou e abre `/login` ou `/signup` vai para `/app`.
Reserva de outra conta: mostra a página não encontrada, sem revelar que a reserva existe
(FR-018, SC-008).

### 4.2 Parâmetros

| Parâmetro | Onde | Valores | Uso |
|-----------|------|---------|-----|
| `intent` | `/login`, `/signup` | `book`, `plan` | Muda o texto de apoio ("Entre para concluir sua reserva") |
| `next` | `/login`, `/signup` | caminho interno começando com `/app` | Destino depois de entrar. Só caminhos internos são aceitos, para evitar redirecionamento aberto |
| `space`, `date`, `start`, `hours` | `/app/bookings/new` | id do espaço, `AAAA-MM-DD`, `HH:MM`, horas | Reserva em montagem; a tela valida tudo de novo (RN03 a RN05) |
| `need` | `/app/spaces` | `meeting`, `focus`, `dev`, `creative` | Atalho de necessidade aplicado (RN20) |

### 4.3 Endereços antigos

Os endereços em português usados nos protótipos anteriores redirecionam, para não quebrar links
já compartilhados:

| Antigo | Novo |
|--------|------|
| `/entrar` | `/login` |
| `/entrar?etapa=recuperar` | `/forgot-password` |
| `/cadastro` | `/signup` |
| `?para=reservar` · `?para=plano` | `?intent=book` · `?intent=plan` |

## 5. Contas, sessão e dados pessoais

O MVP não tem servidor, então conta e sessão são simuladas no navegador. **Não é segurança de
produção**: serve para demonstrar o comportamento exigido pela spec.

- **Senha:** guardada como hash SHA-256 com sal aleatório por conta, calculado com a Web Crypto
  API do navegador. A senha em texto nunca é gravada (FR-019). **Proposta** (TD2).
- **Unicidade:** e-mail e documento únicos entre as contas do navegador (RN14, MSG-01).
- **Sessão:** guarda só o id da conta. "Sair" apaga a sessão.
- **Isolamento:** toda consulta do `store` filtra pela conta da sessão (TR-05).
- **Recuperar senha e e-mails:** não há envio real. A tela mostra a confirmação genérica e o
  protótipo registra o que seria enviado.
- **Conta de demonstração:** a conta de exemplo (Ana, membro do plano Profissional) não tem
  senha. Entra-se nela pelo botão "Entrar com a conta de exemplo", no login, que existe só no
  protótipo. Contas criadas no cadastro entram com e-mail e senha.

## 6. Dados no navegador

### 6.1 Armazenamento

- Um único registro no `localStorage`, na chave `hubbi:v2`, com todas as coleções. O número da
  versão permite trocar o formato sem quebrar dados antigos: se a versão não bater, os dados de
  exemplo são recarregados. **Proposta** (TD1).
- Na primeira visita, o `store` grava os dados de exemplo do
  [data-model](specs/001-fluxos-reservas-hubbi/data-model.md) (seção 5).
- Além da Ana, os dados de exemplo trazem duas pessoas fictícias sem senha (Diana, no Plano Social, e Bruno) com reservas concluídas, uma falta e um cancelamento antecipado, para os indicadores de `/impact` terem números. Elas nunca aparecem nas telas de acesso.
- Ação de protótipo **Restaurar dados de exemplo** apaga tudo e recomeça.
- Com o site aberto em mais de uma aba, cada aba recarrega os dados quando outra grava (evento
  `storage`), para uma aba não sobrescrever as mudanças da outra.
- Se o navegador bloquear o armazenamento (janela anônima restrita), o site funciona só na
  memória e avisa que nada será salvo.

### 6.2 Coleções

Seguem as entidades da spec 001 (seção Key Entities) e os campos do data-model:

| Coleção | Campos principais | Regras |
|---------|-------------------|--------|
| `clients` | id, nome, e-mail, documento, telefone, hash e sal da senha, situação | RN14, RN15 |
| `spaces` | id, nome, tipo, lugares, preço/hora, funcionamento, durações, características | RN01, RN04, RN05, RN20 |
| `plans` | id, nome, desconto, preço, duração em dias, social, categorias | RN13, RN19 |
| `subscriptions` | cliente, plano, início, vencimento, situação, elegibilidade social | RN13, RN19 |
| `bookings` | cliente, espaço, início, fim, estado, valor cheio, desconto, plano vigente, abatimento verde, valor final, meio de chegada | RN03, RN06, RN08, RN23 |
| `bookingHistory` | reserva, de, para, data e hora, responsável | RN09 |
| `charges` | cliente, vínculo, tipo, valor devido, valor pago, situação | RN07, RN11, RN12 |
| `pointsLedger` | cliente, tipo, pontos, reserva, data, validade | RN22, RN23 |

Nada é apagado: cancelar e concluir só mudam o estado e acrescentam histórico (RN09, Constituição
III).

### 6.3 Datas e horários

- As reservas de exemplo são criadas **relativas ao dia de hoje**, para a demonstração sempre ter
  reservas futuras nas três faixas de multa. **Proposta** (TD3).
- Os horários usam o fuso do navegador. **Proposta** (TD4); a spec não define fuso.
- Valores em reais com 2 casas, arredondamento meio para cima (data-model, seção 4).

## 7. Regras de negócio no código

Cada regra vira uma função pura em `domain/`, com o código da regra no nome do arquivo ou no
comentário, para manter a rastreabilidade (Constituição V).

| Função | Regras | Entrada | Saída |
|--------|--------|---------|-------|
| `priceBooking` | RN02, RN06, RN13, RN22 | espaço, horas, plano ativo, pendências, pontos | valor cheio, desconto, abatimento, valor final |
| `checkAvailability` | RN01, RN03, RN04, RN05, RN12 | espaço, início, fim, reservas | ok ou motivo (MSG-04 a MSG-08) |
| `transition` | RN08, RN10 | reserva, ação, agora | novo estado ou recusa com motivo |
| `cancellationQuote` | RN07, RN11 | reserva, cobrança, agora | multa, valor retido, estorno, saldo de multa |
| `expirePending` | RN12 | reservas, agora | reservas expiradas |
| `pointsFor` | RN22, RN23 | evento, extrato | lançamentos de pontos |
| `impactIndicators` | RN21 | reservas, assinaturas, extrato, período | os 8 indicadores |
| `filterSpaces` | RN20 | espaços, filtros | espaços que atendem a todos os critérios |

As telas mostram os resultados dessas funções e nunca fazem a conta por conta própria.

## 8. Publicação

- **Vercel**, projeto importado do GitHub, preset Vite: build `npm run build`, saída `dist`.
- `vercel.json` manda toda rota para o `index.html`, então `/login` e `/app/bookings/...`
  abrem direto ao recarregar.
- Cada branch gera uma prévia com endereço próprio, útil para revisar antes da apresentação.
- Variável `VITE_SHOW_PROTO=false` esconde a barra de protótipo. Para a apresentação, a barra
  precisa ficar **visível**, porque é ela que simula a equipe (PRD, seção 6.3).
- Domínio próprio: [A DECIDIR]. Sem domínio, o site fica em um endereço `*.vercel.app`.

## 9. Requisitos não funcionais

| Tema | Requisito | Como verificar |
|------|-----------|----------------|
| Responsividade | Sem rolagem horizontal de 360 a 1920 px; menu da landing abaixo de 1020 px | Medir em 360, 390, 768, 1024, 1280, 1920 |
| Desempenho | JavaScript inicial abaixo de 150 kB comprimido (hoje cerca de 70 kB) | Saída do `npm run build` |
| Acessibilidade | Contraste AA, foco visível, teclado, rótulos, erros ligados aos campos, movimento reduzido | Checklist do [design.md](design.md), seção 9 |
| Navegadores | Duas últimas versões de Chrome, Edge, Firefox e Safari, no computador e no celular | Teste manual antes da apresentação |
| Idioma | Interface em pt-BR; datas `06/10/2026`, horas `14:30`, valores `R$ 1.234,56` | Formatação com `Intl` em pt-BR |
| Robustez | Sem armazenamento disponível, o site funciona na memória e avisa | Testar em janela anônima |

## 10. Qualidade

- `npm run build` verifica os tipos (TypeScript estrito) e gera o site; precisa passar antes de
  publicar.
- Testes automáticos das funções de `domain/` com Vitest, um arquivo por regra, na pasta `test/`
  já existente. **Proposta** (TD5).
- Antes da apresentação, percorrer os cenários do
  [quickstart](specs/001-fluxos-reservas-hubbi/quickstart.md) que cobrem as telas do MVP.

## 11. Fora do escopo técnico

Servidor e banco de dados, e-mail real, pagamento online, análise de uso (analytics), painel da
equipe e internacionalização da interface.

## 12. Decisões técnicas

| ID | Decisão | Situação |
|----|---------|----------|
| TD1 | Regras em `domain/` e persistência em `store/`, com um registro versionado `hubbi:v2` no localStorage | Proposta |
| TD2 | Senha com hash SHA-256 e sal pela Web Crypto API | Proposta |
| TD3 | Reservas de exemplo relativas ao dia de hoje | Proposta |
| TD4 | Horários no fuso do navegador | Proposta |
| TD5 | Vitest para testar as regras | Proposta |
| TD6 | Rotas em inglês (seção 4), com redirecionamento dos endereços antigos | Aceita (PRD, D7) |
| TD7 | Sem framework de UI ou CSS; design system próprio | Em uso |

## 13. Pendências

| # | Pendência |
|---|-----------|
| 1 | Aceite das propostas TD1 a TD5 |
| 2 | Domínio próprio ou endereço `*.vercel.app` |
