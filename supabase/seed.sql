-- ========================================================================
-- Seed: cadastro único de pessoas (seção 6) + tabela de valores de diárias
-- vigente pela Portaria nº 021/2026, desde 02/02/2026 (seção 4.1).
-- Idempotente: pode ser rodado mais de uma vez sem duplicar linhas.
-- ========================================================================

insert into pessoas (matricula, nome, cargo, categoria) values
  ('1108', 'Alexsania Vitoria Martins Alves', 'Diretora de Tesouraria e Financeiro — Função Comissionada', 'Comissionado'),
  ('505',  'Aparecida Josemara Espuri Teixeira', 'Auxiliar de Serviços Gerais — Função Efetiva', 'Efetivo'),
  ('508',  'Clélio Braz de Souza', 'Oficial Administrativo — Função Efetiva', 'Efetivo'),
  ('1063', 'Cleusa Francisca de Carvalho Marcondes', 'Contadora — Função Efetiva', 'Efetivo'),
  ('1080', 'Elder Wander de Carvalho', 'Vereador — Função Agente Político', 'Vereador'),
  ('1065', 'Izabella Ribeiro e Garcia de Oliveira', 'Auxiliar Administrativo — Função Efetiva', 'Efetivo'),
  ('506',  'Jose Fernando Luiz', 'Oficial Administrativo — Função Efetiva', 'Efetivo'),
  ('1106', 'João Marcelo Hipólito de Souza', 'Diretor Executivo — Função Comissionada', 'Comissionado'),
  ('1104', 'Lucas Silva Oliveira', 'Procurador Adjunto — Função Efetiva', 'Efetivo'),
  ('1081', 'Luciane Souza Lima', 'Vereadora — Função Agente Político', 'Vereador'),
  ('1083', 'Marcos Memento', 'Vereador — Função Agente Político', 'Vereador'),
  ('1084', 'Mariana Dessimoni Dias Azarias', 'Vereadora — Função Agente Político', 'Vereador'),
  ('1085', 'Mário Cezar Batista Leandro', 'Vereador — Função Agente Político', 'Vereador'),
  ('1091', 'Orlando Candido dos Santos Neto', 'Procurador Geral — Função Comissionada', 'Comissionado'),
  ('1086', 'Rogério de Paula Pedroso', 'Vereador — Função Agente Político', 'Vereador'),
  ('1087', 'Ronaldo Luiz Bispo', 'Vereador — Função Agente Político', 'Vereador'),
  ('1064', 'Sônia Maria Ricardino', 'Auxiliar Administrativo — Função Efetiva', 'Efetivo'),
  ('1088', 'Thuler Adriano Spuri', 'Vereador — Função Agente Político', 'Vereador'),
  ('1113', 'Thúlio Santos e Silva', 'Coordenador — Função Comissionada', 'Comissionado'),
  ('1089', 'Tullio Ian Marangoni de Morais', 'Vereador — Função Agente Político', 'Vereador'),
  ('1090', 'Vanessa Aguiar de Souza', 'Vereador — Função Agente Político', 'Vereador'),
  ('507',  'Vanilza de Lourdes Silva', 'Auxiliar de Serviços Gerais — Função Efetiva', 'Efetivo'),
  ('1107', 'Vitor Cesar Rodrigues Junior', 'Diretor de Divisão Administrativa do Legislativo — Função Comissionada', 'Comissionado'),
  ('1094', 'Viviane Villas Boas Magrinelli', 'Diretora de Comunicação — Função Comissionada', 'Comissionado'),
  ('1102', 'Washington Correa Lima Neto', 'Vereador — Função Agente Político', 'Vereador')
on conflict (matricula) do update set
  nome = excluded.nome,
  cargo = excluded.cargo,
  categoria = excluded.categoria;

-- Tabela de valores — Portaria nº 021/2026 (vigente desde 02/02/2026).
-- Sem pernoite (não há faixa "Até 60 km" no com-pernoite, ver seção 4.1).
insert into diarias_tabela_valores (portaria, vigente_desde, tipo, faixa, categoria, valor) values
  ('021/2026', '2026-02-02', 'semPernoite', 'Até 60 km', 'Efetivo', 111.00),
  ('021/2026', '2026-02-02', 'semPernoite', 'Até 60 km', 'Comissionado', 111.00),
  ('021/2026', '2026-02-02', 'semPernoite', 'Até 60 km', 'Vereador', 111.00),

  ('021/2026', '2026-02-02', 'semPernoite', '61 km a 120 km', 'Efetivo', 154.00),
  ('021/2026', '2026-02-02', 'semPernoite', '61 km a 120 km', 'Comissionado', 176.00),
  ('021/2026', '2026-02-02', 'semPernoite', '61 km a 120 km', 'Vereador', 231.00),

  ('021/2026', '2026-02-02', 'semPernoite', '121 km a 300 km', 'Efetivo', 231.00),
  ('021/2026', '2026-02-02', 'semPernoite', '121 km a 300 km', 'Comissionado', 297.00),
  ('021/2026', '2026-02-02', 'semPernoite', '121 km a 300 km', 'Vereador', 353.00),

  ('021/2026', '2026-02-02', 'semPernoite', 'Belo Horizonte', 'Efetivo', 297.00),
  ('021/2026', '2026-02-02', 'semPernoite', 'Belo Horizonte', 'Comissionado', 353.00),
  ('021/2026', '2026-02-02', 'semPernoite', 'Belo Horizonte', 'Vereador', 408.00),

  ('021/2026', '2026-02-02', 'semPernoite', 'Acima de 300 km e São Paulo', 'Efetivo', 462.00),
  ('021/2026', '2026-02-02', 'semPernoite', 'Acima de 300 km e São Paulo', 'Comissionado', 693.00),
  ('021/2026', '2026-02-02', 'semPernoite', 'Acima de 300 km e São Paulo', 'Vereador', 748.00),

  ('021/2026', '2026-02-02', 'semPernoite', 'Brasília e outras capitais', 'Efetivo', 638.00),
  ('021/2026', '2026-02-02', 'semPernoite', 'Brasília e outras capitais', 'Comissionado', 770.00),
  ('021/2026', '2026-02-02', 'semPernoite', 'Brasília e outras capitais', 'Vereador', 979.00),

  ('021/2026', '2026-02-02', 'comPernoite', '61 km a 120 km', 'Efetivo', 297.00),
  ('021/2026', '2026-02-02', 'comPernoite', '61 km a 120 km', 'Comissionado', 407.00),
  ('021/2026', '2026-02-02', 'comPernoite', '61 km a 120 km', 'Vereador', 528.00),

  ('021/2026', '2026-02-02', 'comPernoite', '121 km a 300 km', 'Efetivo', 528.00),
  ('021/2026', '2026-02-02', 'comPernoite', '121 km a 300 km', 'Comissionado', 638.00),
  ('021/2026', '2026-02-02', 'comPernoite', '121 km a 300 km', 'Vereador', 748.00),

  ('021/2026', '2026-02-02', 'comPernoite', 'Belo Horizonte', 'Efetivo', 638.00),
  ('021/2026', '2026-02-02', 'comPernoite', 'Belo Horizonte', 'Comissionado', 770.00),
  ('021/2026', '2026-02-02', 'comPernoite', 'Belo Horizonte', 'Vereador', 924.00),

  ('021/2026', '2026-02-02', 'comPernoite', 'Acima de 300 km e São Paulo', 'Efetivo', 869.00),
  ('021/2026', '2026-02-02', 'comPernoite', 'Acima de 300 km e São Paulo', 'Comissionado', 924.00),
  ('021/2026', '2026-02-02', 'comPernoite', 'Acima de 300 km e São Paulo', 'Vereador', 1045.00),

  ('021/2026', '2026-02-02', 'comPernoite', 'Brasília e outras capitais', 'Efetivo', 1045.00),
  ('021/2026', '2026-02-02', 'comPernoite', 'Brasília e outras capitais', 'Comissionado', 1100.00),
  ('021/2026', '2026-02-02', 'comPernoite', 'Brasília e outras capitais', 'Vereador', 1156.00)
on conflict (portaria, tipo, faixa, categoria) do update set
  valor = excluded.valor,
  vigente_desde = excluded.vigente_desde;

-- Nota: a diária internacional (art. 8º-A) NÃO entra aqui — é lançada como
-- item modo='manual' em diarias_itens, calculada em código como 120% do
-- valor comPernoite/Brasília e outras capitais/Vereador vigente (ver
-- seção 4.2 da especificação). Não fixar esse valor em tabela.
