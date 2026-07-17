-- ========================================================================
-- Migration 0008: Gestão de Usuários pela interface
--
-- Correção de segurança: auth_papel() e auth_pessoa_id() não checavam
-- usuarios.ativo, então marcar alguém como "inativo" não revogava
-- acesso nenhum — a pessoa continuava logando e usando o sistema
-- normalmente, já que toda policy de RLS depende dessas duas funções.
-- Passa a exigir ativo = true; um usuário inativado perde acesso a
-- tudo (RLS nega, mesmo que a sessão de login continue válida).
-- ========================================================================

create or replace function auth_papel()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select papel from usuarios where auth_user_id = auth.uid() and ativo = true;
$$;

create or replace function auth_pessoa_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select p.id from pessoas p
  join usuarios u on u.id = p.usuario_id
  where u.auth_user_id = auth.uid() and u.ativo = true;
$$;
