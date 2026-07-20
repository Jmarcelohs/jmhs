-- ========================================================================
-- Migration 0011: placa e modelo do veículo no requerimento de reembolso
--
-- Quando o sub-assunto é "combustivel" (Despesas com Combustível e
-- Estacionamento), a aplicação passa a exigir o preenchimento da placa
-- e do modelo do veículo usado — para outros sub-assuntos, os campos
-- ficam em branco. Colunas nullable aqui porque a obrigatoriedade é
-- condicional (só quando subassunto=combustivel) e essa regra é
-- validada na aplicação, não no banco.
-- ========================================================================

alter table requerimentos_reembolso add column if not exists placa_veiculo text;
alter table requerimentos_reembolso add column if not exists modelo_veiculo text;

notify pgrst, 'reload schema';
