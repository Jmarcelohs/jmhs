-- ========================================================================
-- Migration 0010: corrige a regra de numeração da Locação de Veículos
--
-- A migration 0009 implementou um contador atômico sequencial simples,
-- mas a regra real (conforme a ferramenta original) é outra: sugerir
-- max(número já usado no ano) + 1 e, só quando NÃO existe nenhum
-- registro ainda para o ano de 2026, sugerir 47 (continuando a
-- numeração manual por e-mail que a Câmara já praticava antes da
-- ferramenta existir). Anos sem nenhum registro além de 2026 começam
-- do 1. Essa lógica é calculada direto na aplicação a partir dos
-- registros existentes — não precisa mais de contador em tabela própria.
-- ========================================================================

drop function if exists proximo_numero_veiculo_locacao(integer);
drop table if exists veiculos_locacao_contadores;

notify pgrst, 'reload schema';
