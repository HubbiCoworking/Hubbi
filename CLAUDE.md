# Hubbi: instruções para o Claude

Projeto acadêmico (Fatec Zona Sul): reservas de espaços de coworking. Documentos em `docs/`
([PRD](docs/PRD.md), [TRD](docs/TRD.md), [design.md](docs/design.md),
[spec 001](docs/specs/001-fluxos-reservas-hubbi/spec.md), [constituição](docs/.specify/memory/constitution.md)).
Responder sempre em português do Brasil.

## Como trabalhar

- Construir **por fluxo, uma tela por vez** (PRD, seção 5.4). Não adiantar telas de outros fluxos.
- Não decidir regra de negócio sozinho: perguntar antes. Divergência da spec vai para o quadro de
  versões (`docs/specs/001-fluxos-reservas-hubbi/contracts/design-brief-versioning.md`).
- Citar regras por código (RNxx, FR-xxx, MSG-xx, Txx); nunca reescrever a regra com outras palavras.
- Rotas da URL em inglês (`/login`, `/app/bookings`); todo texto da interface em português.
- Ao terminar uma tela: atualizar a situação no PRD (5.2 e 5.4) e a tabela de rotas do README.

## Comandos

O Node vem do nvm e não está no PATH de shells não interativos:

```bash
export PATH=$HOME/.nvm/versions/node/v24.21.0/bin:$PATH
npm run build   # checa tipos (TS estrito) e gera dist/; precisa passar antes de entregar
npm run dev     # http://localhost:5173 (no app: preview "hubbi-web" em docs/.claude/launch.json)
```

Dados do protótipo ficam no `localStorage`, chave `hubbi:v2`, formato na versão 5 (`VERSION` em
`src/store/store.ts`). Ao mudar
o formato, subir `VERSION` e escrever a migração em `load()`, sem apagar contas já criadas.

## Layout e responsividade: regras obrigatórias

### O erro que já aconteceu duas vezes

1. **Tela inicial (`/app`)**: o portal inteiro tinha `max-width` e `margin-inline: auto`. Em telas
   largas o menu lateral ficava solto, a ~130 px da borda, e o conteúdo esticado.
2. **Reserva feita (`/app/bookings/:id/confirmation`)**: o conteúdo era uma coluna de 640 px
   centralizada dentro da área ao lado do menu. Em 1920 px o título começava em x≈772, enquanto
   nas outras telas começava em x≈336: um bloco estreito boiando no meio da tela.

Os dois passaram porque eu conferi só em larguras pequenas ou na captura reduzida do painel do
navegador, que esconde esse tipo de erro.

### Regras

- **O menu lateral encosta na margem da página** (`--gutter`: 16 px; 12 px abaixo de 560 px).
- **O conteúdo do portal começa sempre na mesma margem ao lado do menu.** `.portal-main` usa
  `margin-inline: 0 auto` e só a largura máxima (1240 px; 1400 px a partir de 1700 px) limita o
  lado direito. **Nunca centralizar** o conteúdo nem uma tela inteira no espaço livre.
- **Tela com pouco conteúdo não vira coluna estreita centralizada.** Usar duas colunas no
  computador (conteúdo principal + painel lateral, como em T07 e T08) e uma coluna abaixo de
  1024 px. Larguras máximas pequenas (`max-width: 560px` etc.) só para blocos alinhados à
  esquerda, como estados de erro e formulários curtos.
- **Telas de acesso** (login, cadastro): formulário à esquerda e painel roxo à direita; o
  formulário cresce com a tela (480 a 640 px). Não voltar a 420 px fixos.
- **Landing**: é a única página com conteúdo centralizado (`--wrap`), por ser vitrine.
- Margens laterais negativas (ex.: barra superior) usam `calc(-1 * var(--gutter))`, nunca px fixo.
- Elementos fixos embaixo (barra inferior, barra "Estados do protótipo", painel "Mais") não podem
  cobrir uns aos outros.

### Verificação antes de dizer que uma tela está pronta

1. Medir em **1920, 1440, 1280, 1024, 768, 390 e 360 px** (iframes fora da tela ou o menu
   Viewport), não só olhar a captura do painel:
   - rolagem horizontal = 0 em todas as larguras;
   - a borda esquerda do conteúdo (título ou primeiro bloco) é a **mesma das outras telas do
     portal** na mesma largura (1280 → 312 px; 1440 → 316 px; 1920 → 336 px);
   - nenhum bloco principal estreito centralizado com sobra grande dos dois lados.
2. Ver o celular (375 × 812) em captura: textos, botões de 44 px e abas sem corte.
3. `npm run build` sem erros.
