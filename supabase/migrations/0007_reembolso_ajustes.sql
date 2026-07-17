-- ========================================================================
-- Migration 0007: ajustes no módulo de Requerimento de Reembolso
--
-- Snapshot do CPF no próprio requerimento: em vez de sempre buscar em
-- pessoas_dados_sensiveis na hora de exibir/imprimir, grava o CPF no
-- momento da criação. Isso mantém o histórico do requerimento estável
-- mesmo se o CPF cadastrado da pessoa for corrigido depois, e evita uma
-- consulta extra (com RLS própria) toda vez que a tela ou o PDF carrega.
-- ========================================================================

alter table requerimentos_reembolso add column if not exists cpf text;

notify pgrst, 'reload schema';
