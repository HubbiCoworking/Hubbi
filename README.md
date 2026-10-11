# Hubbi

Reservas de espaços de trabalho (coworking) com preço claro. Este repositório tem:

- `docs/`: especificação (spec 001, fluxos, regras de negócio) e protótipos em HTML.
- `src/`: aplicação web em React + TypeScript (Vite).

## Rodar localmente

Requer Node.js 18.18 ou mais novo (testado com o 24).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # checa os tipos e gera dist/
npm run preview    # serve o build
```

## Telas

As rotas da URL são em inglês; o texto da interface é em português ([TRD](docs/TRD.md), seção 4).

| Rota | Tela | Spec |
|------|------|------|
| `/` | Landing page: busca por necessidade, simulador de preço, planos, Hubbi Verde, dúvidas | US1, US8–US10 |
| `/login` | Login (T02). Aceita `?intent=book` e `?intent=plan` | F01, MSG-02 |
| `/forgot-password` | Recuperar senha (T03) | F01 |
| `/signup` | Cadastro (T01). Aceita `?intent=book` e `?intent=plan` | F01, MSG-01 |
| `/app` | Início do portal (T45). Exige conta; sem sessão, vai ao login e volta | FR-003, RN13 |
| `/app/spaces` | Espaços (T04): busca por data, horário e duração, atalhos e filtros. Aceita `?need=meeting\|focus\|dev\|creative` e `?date=&start=&hours=` | FR-003, FR-023, RN01–RN05, RN12, RN13, RN20 |
| `/app/bookings/new` | Resumo da reserva (T07). Recebe `?space=&date=&start=&hours=&need=`, confere de novo a disponibilidade e cria a reserva; cartão Comodidades e painel T48 (spec 002) | FR-004, FR-005, FR-025–FR-031, RN02–RN07, RN12, RN13, RN22–RN26 |
| `/app/bookings` | Minhas reservas (T11): abas Próximas, Passadas e Canceladas (`?tab=past\|cancelled`) | FR-006, FR-011, RN08, RN09, RN12 |
| `/app/bookings/:id` | Detalhe da reserva (T12) e cancelamento (T18): valores gravados, pagamento, linha do tempo e multa/estorno antes de confirmar. `?cancel=1` abre o painel. Cartão Comodidades: pedir itens (T48), situação e cancelar sem custo. A barra do protótipo simula a recepção (pagamento, concluir, não compareceu, prazo vencido) e a cozinha (entregar item, receber comodidades) | FR-005–FR-007, FR-011, FR-029, FR-032–FR-034, RN06–RN12, RN22, RN26, RN27 |
| `/app/plan` | Meu plano (T28) e solicitar plano (T29): contratar, trocar, cancelar a renovação, renovar perto do vencimento e pedir o Plano Social (categoria + observação curta). A barra do protótipo simula a gerência e a recepção | FR-013, FR-022, RN13, RN19 |
| `/app/rewards` | Hubbi Verde (T46): saldo, progresso até o resgate, sequência sem falta e extrato por mês. A barra do protótipo simula a recepção confirmando a chegada limpa | FR-025, FR-026, RN22, RN23 |
| `/impact` | Nosso impacto (T47): página pública com os oito indicadores da RN21 em três períodos; só totais, sem dado pessoal | FR-024, RN21, MSG-25 |
| `/app/bookings/:id/confirmation` | Reserva feita (T08): comprovante com código, estado, valores gravados e prazo de pagamento. Só o dono vê | FR-004, RN06, RN09, RN12, RN13 |

Os endereços antigos `/entrar` e `/cadastro` redirecionam para os novos. As próximas telas do MVP
estão no [PRD](docs/PRD.md), seção 5.2.

Não há servidor: contas, reservas, plano e pontos ficam salvos no navegador (`localStorage`,
chave `hubbi:v2`). Na primeira visita entram os dados de exemplo da cliente Ana (membro do plano
Profissional); no login, o botão **Entrar com a conta de exemplo** entra nela. Contas criadas no
cadastro entram com e-mail e senha. A barra "Estados do protótipo" tem **Restaurar dados de
exemplo**.

## Documentos

- [PRD](docs/PRD.md): escopo do MVP, telas, decisões e pendências.
- [TRD](docs/TRD.md): requisitos técnicos, rotas, dados no navegador e publicação.
- [ROTEIRO.md](docs/ROTEIRO.md): roteiro de apresentação de cerca de 11 minutos, com o passo a passo, plano B e perguntas prováveis.
- [design.md](docs/design.md): design system (cores, tipografia, componentes, acessibilidade).
- [Spec 001](docs/specs/001-fluxos-reservas-hubbi/spec.md): regras de negócio e requisitos.

## Estrutura

```text
src/
├── components/      # Logo, símbolo, ícones, barra de estados do protótipo
├── data/catalog.ts  # dados de exemplo e regras numéricas (planos, pontos, multa)
├── features/
│   ├── landing/     # seções da landing
│   └── auth/        # layout e campos das telas de acesso
├── lib/             # formatação, validação (CPF, CNPJ, e-mail), movimento
├── pages/           # Landing, Login, Cadastro, NotFound
└── styles/          # tokens.css (paleta e base), landing.css, auth.css
```

## Publicar na Vercel

1. Suba o repositório para o GitHub.
2. Na Vercel, **Add New → Project** e importe o repositório. O preset **Vite** é detectado
   (build `npm run build`, saída `dist`). O `vercel.json` já redireciona todas as rotas para o
   `index.html`, então `/entrar` e `/cadastro` funcionam ao recarregar a página.
3. Opcional: em **Environment Variables**, defina `VITE_SHOW_PROTO=false` para esconder a barra
   "Estados do protótipo" no site publicado.
