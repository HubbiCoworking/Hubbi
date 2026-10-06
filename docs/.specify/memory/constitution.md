<!--
Sync Impact Report
- Version change: (template não preenchido) → 1.0.0
- Princípios adicionados: I. Escopo Enxuto e Delimitado; II. Regras de Negócio como Fonte da Verdade;
  III. Integridade das Reservas e do Histórico; IV. Precificação Transparente e Rastreável;
  V. Rastreabilidade Requisito → Regra → Fluxo; VI. Segurança e Privacidade (LGPD)
- Seções adicionadas: Escopo e Restrições do Projeto; Fluxo de Trabalho e Qualidade; Governança
- Seções removidas: nenhuma
- TODOs adiados: nenhum (stack tecnológica deliberadamente não definida; ver Restrições)
-->

# Hubbi Constitution

Sistema de gerenciamento de salas e espaços para coworking, da empresa fictícia Hubbi,
desenvolvido na disciplina de Engenharia de Software (Fatec Zona Sul).

## Core Principles

### I. Escopo Enxuto e Delimitado
O sistema Hubbi MUST tratar da gestão de reservas de salas e espaços, incluindo clientes,
planos, preços e registro de pagamentos. Metas do negócio físico (conectividade, NPS,
break-even, eventos, happy hours, comunidade) NÃO são requisitos do sistema e MUST NOT
aparecer como requisito funcional ou não funcional. Todo módulo listado MUST ter ao menos um
requisito funcional; módulo sem requisito MUST ser removido ou adiado explicitamente.
Controle de acesso físico, reservas recorrentes e gateway de pagamento estão fora do escopo
da versão atual.
*Justificativa:* o documento inicial misturava operação do espaço com software, gerando
requisitos sem módulo e módulos sem requisito.

### II. Regras de Negócio como Fonte da Verdade
Cada regra de negócio MUST ter um código único (RNxx) e ser enunciada uma única vez. Requisitos
funcionais, fluxos e protótipos MUST referenciar a regra, nunca repeti-la com outras palavras.
Duas regras que se contradigam MUST ser resolvidas antes de qualquer artefato derivado ser
considerado pronto.
*Justificativa:* RF09, RN05 e RN13 diziam o mesmo, e a RN02 contradizia os objetivos de passe
diário.

### III. Integridade das Reservas e do Histórico
- Um mesmo espaço MUST NOT ter duas reservas ativas sobrepostas no mesmo período.
- Toda reserva MUST estar ligada a um cliente cadastrado e a um espaço ativo, e MUST respeitar
  o horário de funcionamento e os limites de duração mínima e máxima definidos.
- Toda reserva MUST seguir um ciclo de vida explícito: pendente, confirmada, concluída,
  cancelada ou no-show. Transições fora do diagrama de estados MUST ser proibidas.
- Reservas MUST NEVER ser apagadas; cancelamento e conclusão apenas mudam o estado e mantêm o
  histórico (cliente, espaço, período, estado).
- Clientes e espaços com histórico MUST ser inativados (exclusão lógica), nunca removidos.
- O prazo de cancelamento e a política de multa ou estorno MUST estar definidos em regras de
  negócio e MUST ser aplicados de forma determinística.
*Justificativa:* a exclusão física de clientes (RF02) quebrava o histórico e a integridade.

### IV. Precificação Transparente e Rastreável
O preço da reserva MUST ser calculado a partir de tabela de valor por espaço/hora, com desconto
percentual definido pelo plano do cliente. Clientes avulsos (sem plano) MUST pagar o valor cheio
e MUST poder reservar; clientes com plano ativo MUST pagar menos. O valor, o desconto aplicado e
o plano vigente MUST ser gravados na reserva no momento da criação, de modo que mudanças futuras
de tabela ou de plano não alterem reservas já feitas. Todo pagamento MUST estar associado a um
cliente e a uma reserva ou cobrança de plano, com situação explícita (pendente, realizado,
estornado). O pagamento é registrado manualmente pela equipe.
*Justificativa:* o desconto por plano é a regra central de valor do negócio e precisa ser
auditável.

### V. Rastreabilidade Requisito → Regra → Fluxo
Todo requisito (RF/RNF) MUST citar as regras de negócio que o governam, e todo fluxo ou tela
do protótipo MUST citar os requisitos que realiza. Código de requisito e regra MUST ser estável:
não reutilizar nem renumerar códigos já publicados. Numeração de quadros, figuras e versões do
documento MUST ser sequencial e sem lacunas. Cada fluxo prototipado (reserva, cancelamento,
cadastro, pagamento, consulta de disponibilidade) MUST cobrir o caminho feliz e os principais
caminhos de erro.
*Justificativa:* como a entrega é documento mais protótipo, a rastreabilidade substitui os
testes automatizados como evidência de qualidade.

### VI. Segurança e Privacidade (LGPD)
O sistema MUST ter dois perfis distintos: equipe (administração e recepção) e membro/cliente
(portal próprio). Cada perfil MUST ver e executar apenas o que lhe cabe (menor privilégio).
Autenticação MUST ser exigida para todo acesso a dados pessoais, senhas MUST ser armazenadas
apenas como hash, e dados pessoais MUST ser coletados apenas na medida necessária, em
conformidade com a LGPD. Mensagens de erro MUST ser claras sem revelar dados sensíveis.
*Justificativa:* o portal do membro amplia a superfície de acesso a dados pessoais.

## Escopo e Restrições do Projeto

- **Atores:** equipe interna (administra cadastros, espaços, planos, pagamentos e relatórios) e
  membros/clientes (consultam disponibilidade e reservam pelo portal). Clientes avulsos são
  clientes sem plano.
- **Entregáveis:** documento de requisitos no padrão ABNT e protótipo navegável no Figma, com
  fluxos mapeados no FigJam. Implementação em código não é entregável obrigatório.
- **Tecnologia:** a stack não está definida e MUST NOT ser tratada como restrição até decisão
  formal em plano de implementação. Requisitos MUST ser escritos de forma independente de
  tecnologia.
- **Desempenho e responsividade:** operações comuns MUST responder em até 2 segundos em condições
  normais, e a interface MUST ser responsiva para computador, tablet e celular.
- **Responsáveis:** a equipe de cinco integrantes e o professor orientador (Josenyr Santos Rocha).

## Fluxo de Trabalho e Qualidade

- Toda alteração no documento ou no protótipo MUST gerar entrada no quadro de versionamento,
  com versão, responsável e descrição.
- Antes de uma versão ser considerada pronta, a equipe MUST verificar: ausência de regras
  duplicadas ou conflitantes, requisitos com regra citada, módulos todos cobertos e numeração
  sequencial.
- Mudança de regra de negócio MUST ser revisada por ao menos um outro integrante antes de entrar
  no documento.
- Todo requisito MUST ser verificável: deve ser possível demonstrar no protótipo ou descrever em
  um cenário de aceitação com entrada e resultado esperado.

## Governance

Esta constituição prevalece sobre quaisquer outras práticas do projeto. Emendas MUST ser
propostas por escrito, aprovadas por maioria da equipe e registradas com data e justificativa.
O versionamento da constituição segue o versionamento semântico: MAJOR para remoção ou
redefinição incompatível de princípios, MINOR para novo princípio ou ampliação material, PATCH
para esclarecimentos e correções de redação. Revisões e entregas MUST verificar a conformidade
com esta constituição, e qualquer exceção MUST ser justificada por escrito no documento.

**Version**: 1.0.0 | **Ratified**: 2026-10-05 | **Last Amended**: 2026-10-05
