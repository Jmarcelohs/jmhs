-- ========================================================================
-- Migration 0012: impede mais de uma prestação de contas por diária
--
-- A tela de prestação de contas sempre buscou "a" prestação de uma
-- diária com .maybeSingle() (espera 0 ou 1 linha). Sem uma constraint
-- garantindo isso no banco, envios repetidos do formulário (duplo
-- clique, conexão lenta) criavam várias linhas para a mesma
-- solicitacao_id — a consulta então falhava silenciosamente (o erro
-- do PostgREST era descartado no código) e a tela voltava a mostrar o
-- formulário de CRIAR uma nova prestação pra sempre, escondendo até o
-- campo de anexar fotos/documentos (que só aparece na tela de detalhe,
-- depois que uma prestação existente é encontrada).
--
-- Um índice único parcial (só quando solicitacao_id não é nulo) resolve
-- na origem: a partir de agora, tentar criar uma segunda prestação para
-- a mesma diária dá erro de "duplicate key", que a aplicação já sabe
-- transformar numa mensagem amigável.
-- ========================================================================

create unique index if not exists diarias_prestacoes_solicitacao_id_key
  on diarias_prestacoes_contas (solicitacao_id)
  where solicitacao_id is not null;
