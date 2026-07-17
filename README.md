# Sistema Institucional — Câmara Municipal de Nepomuceno/MG

Next.js (App Router) + Supabase (Postgres/Auth). Módulo piloto: **Diárias de Viagem**
(Resolução nº 040/2023 + Portaria nº 021/2026).

## 1. Pré-requisitos

- Node.js 20+ e npm (verifique com `node --version`).
- Uma conta em [supabase.com](https://supabase.com) (plano gratuito serve para começar).

## 2. Criar o projeto no Supabase

1. Em [supabase.com/dashboard](https://supabase.com/dashboard), crie um novo projeto.
2. Em **Project Settings → API**, copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (fica só no seed, nunca no navegador)
3. Copie `.env.local.example` para `.env.local` e preencha os três valores.

## 3. Aplicar o schema e o seed

### Opção A — SQL Editor do painel Supabase (mais simples)

1. Abra **SQL Editor** no painel do projeto.
2. Cole e execute o conteúdo de [`supabase/migrations/0001_schema.sql`](supabase/migrations/0001_schema.sql).
3. Depois, cole e execute o conteúdo de [`supabase/seed.sql`](supabase/seed.sql) — popula o
   cadastro de 25 pessoas (seção 6 do documento de especificação) e a tabela de valores de
   diárias vigente pela Portaria nº 021/2026.

### Opção B — Supabase CLI

```bash
npx supabase login
npx supabase link --project-ref <seu-project-ref>
npx supabase db push          # aplica supabase/migrations/
npx supabase db execute -f supabase/seed.sql
```

## 4. Criar os primeiros usuários (login)

O Supabase Auth guarda usuários em `auth.users`; a tabela `usuarios` deste projeto guarda o
**papel** de cada um e faz o vínculo com `pessoas`. Para criar o primeiro admin:

1. No painel Supabase, **Authentication → Users → Add user**, crie um usuário com e-mail/senha.
2. No **SQL Editor**, rode (substituindo o e-mail e o `auth_user_id` copiado da tela de usuários):

   ```sql
   insert into usuarios (auth_user_id, nome, email, papel)
   values ('<uuid-do-auth-user>', 'Seu Nome', 'seu-email@nepomuceno.mg.leg.br', 'admin');
   ```

3. (Opcional) Vincule esse usuário a uma linha existente em `pessoas`:

   ```sql
   update pessoas set usuario_id = (select id from usuarios where email = 'seu-email@...')
   where matricula = '1106';
   ```

Repita para os demais papéis (`servidor`, `ordenador_despesa`, `tesoureiro`, `controle_interno`)
conforme forem sendo necessários — ver seção 5 da especificação para o que cada papel pode fazer.

## 5. Rodar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) — você será redirecionado para `/login`.

## 6. Estrutura do projeto

```
src/
  app/
    login/                 rota pública de autenticação
    (app)/                 rotas autenticadas (layout com navegação + logout)
      dashboard/
      pessoas/              cadastro único de servidores/vereadores
      diarias/              lista, nova solicitação, detalhe/autorização/edição
        solicitacao-form.tsx  formulário compartilhado por "nova" e "editar"
        [id]/editar/         edição (mesmo já autorizada) por solicitante/ordenador/admin
    (print)/                rotas de impressão (sem o menu/navegação do app)
      diarias/[id]/imprimir/  Anexo I com o timbrado oficial como fundo (preview + botão)
    api/diarias/[id]/pdf/   gera o PDF num Chromium headless (Puppeteer) e devolve o arquivo
    page.tsx                redireciona "/" para "/dashboard"
  lib/
    supabase/               clientes Supabase (browser/server/middleware) + tipos do banco
    auth/                   helper para ler o usuário logado e seu papel
  proxy.ts                  substitui o antigo middleware.ts (convenção do Next.js 16);
                             protege rotas e renova a sessão do Supabase Auth
public/
  timbrado/pagina-a4.jpg   timbrado oficial (2480×3508px, 300dpi) extraído do .docx fornecido;
                            usado como background-image na página de impressão
supabase/
  migrations/0001_schema.sql  schema completo (núcleo + módulo Diárias + esqueleto dos
                               módulos futuros: Requerimentos, Emendas, Veículos)
  migrations/0002_diarias_editar_autorizada.sql  permite o solicitante editar mesmo após
                                                  autorizada (RLS)
  seed.sql                    25 pessoas + tabela de valores da Portaria 021/2026
```

## 7. O que já está implementado vs. o que falta

**Feito (Fase 0 + piloto do módulo Diárias):**
- Schema relacional completo com RLS (Row Level Security) por papel.
- Login/logout com Supabase Auth, rotas protegidas.
- Cadastro de pessoas: CRUD completo (cadastrar, editar, inativar/ativar, excluir),
  restrito a admin — excluir só funciona se a pessoa não tiver diárias/outros registros
  vinculados, senão o sistema orienta a inativar.
- Diárias: nova solicitação (Anexo I) com cálculo automático pela tabela oficial ou item
  manual, lista com filtro por status, autorizar/indeferir pelo ordenador da despesa,
  editar/excluir (mesmo já autorizada) pelo solicitante, ordenador ou admin.
- Geração de PDF do Anexo I no papel timbrado oficial — botão "Salvar PDF" que renderiza a
  página de impressão num navegador headless (Puppeteer) no servidor e baixa o PDF pronto,
  sem passar pela caixa de diálogo de impressão do navegador.
- Painel com estatísticas (pendentes/autorizadas/indeferidas, valor total autorizado),
  ranking de diárias por solicitante, e listas de diárias realizadas com prestação de
  contas em aberto vs. concluída.
- Prestação de contas (Anexo II): relatório da viagem, demonstrativo financeiro
  débito/crédito, aprovação do ordenador, baixa de pagamento pelo tesoureiro, parecer
  conclusivo do Controle Interno, upload de fotos/documentos (aparecem no PDF), editar/
  excluir, e o respectivo PDF em várias páginas — inclusive combinado com o Anexo I num
  só arquivo. Tudo isso também disponível direto pelas abas "Prestação de contas
  pendente/realizada" na lista de diárias.
- Diária internacional (art. 8º-A), com e sem pernoite: botões no formulário calculam os
  120% da diária de Brasília/capitais categoria Vereador a partir da tabela vigente.
- Verificações informativas do art. 4º (prazo de 2 dias úteis, faixa "até 60 km", pendência
  de prestação de contas anterior) na página da solicitação antes de autorizar — nunca
  bloqueiam, só avisam. Dotação orçamentária continua manual (não há módulo de orçamento).
- Requerimento de Reembolso de Despesas (Art. 9º da Resolução 40/2023): protocolo sequencial
  por ano, prévia ao vivo do texto do requerimento (com valor por extenso em português),
  vínculo opcional a uma diária de viagem — quando autorizado, o valor soma automaticamente no
  demonstrativo financeiro (Anexo II) da diária vinculada ao prestar contas —, decisão do
  ordenador da despesa (autorizar/não autorizar/em análise) e PDF no layout oficial.

**Ainda falta (ver seção 9 da especificação para o roadmap completo):**
- CRUD/gestão de Usuários e papéis pela interface (hoje só via SQL Editor).
- Cálculo automático da gradação por duração do afastamento (seção 4.3 da especificação) —
  hoje o formulário não pede hora de saída/retorno.
- Módulos de Emendas Impositivas e Veículos (só o schema existe).
- Decisão de hospedagem: Vercel (frontend) + Supabase (banco), região São Paulo (`gru1`,
  ver `vercel.json`) — ainda falta confirmar com o jurídico/TI da Câmara se há exigência formal
  de hospedagem em território nacional (seção 10 da especificação). Política de backup também
  segue em aberto.

## 8. Deploy na Vercel

A geração de PDF usa Puppeteer, que só funciona no seu computador (Windows) por padrão. Em
produção na Vercel, o código já troca automaticamente para `puppeteer-core` +
`@sparticuz/chromium` (ver `src/lib/pdf/launch-browser.ts` — a troca é baseada na variável de
ambiente `VERCEL`, que a própria Vercel define sozinha). Você não precisa mexer nisso, só seguir
os passos abaixo.

### 8.1 Repositório no GitHub

O código está em [github.com/Jmarcelohs/jmhs](https://github.com/Jmarcelohs/jmhs), branch
`main`. Para enviar novas alterações depois de commitar localmente:

```bash
git push origin main
```

Se precisar clonar/configurar o repositório em outra máquina:

```bash
git remote add origin https://github.com/Jmarcelohs/jmhs.git
git push -u origin main
```

No primeiro `git push` de uma máquina nova, o Windows deve abrir uma janela pedindo login do
GitHub (Git Credential Manager) — é normal, faça login por ali.

### 8.2 Importar o projeto na Vercel

1. Crie uma conta em [vercel.com](https://vercel.com) (pode entrar direto com o GitHub).
2. **Add New → Project** e selecione o repositório `Jmarcelohs/jmhs`.
3. Em **Environment Variables**, adicione os três valores do seu `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Clique em **Deploy**. A região já vem configurada para São Paulo pelo `vercel.json`.

Se as variáveis foram adicionadas depois do primeiro deploy, é preciso disparar um novo deploy
para elas passarem a valer — o jeito mais simples é fazer qualquer novo `git push` (edite algo
pequeno e commite) ou usar **Deployments → (⋯) do último deploy → Redeploy** no painel da Vercel.

### 8.3 Depois do primeiro deploy

- Toda vez que você der `git push` na branch principal, a Vercel publica uma nova versão
  automaticamente.
- Teste o botão "Salvar PDF" no site publicado — o primeiro PDF gerado depois de um tempo sem
  uso pode demorar alguns segundos a mais (a function "esfria" e o Chromium precisa iniciar de
  novo).
- Se o PDF der timeout, confira em **Project Settings → Functions** se o plano contratado
  permite aumentar a duração máxima da function (já configuramos `maxDuration = 60` no código,
  mas o plano Hobby da Vercel limita a 10s independente disso — pode ser necessário o plano Pro).

## 9. Aviso de segurança / LGPD

A tabela `usuarios` usa a `anon key` pública do Supabase no navegador — por isso **toda tabela
tem Row Level Security habilitada** (ver o final de `supabase/migrations/0001_schema.sql`).

O único dado sensível guardado é o CPF, necessário para os requerimentos de reembolso (Anexo do
Art. 9º da Resolução 40/2023). Ele fica isolado na tabela `pessoas_dados_sensiveis`
(`supabase/migrations/0006_requerimentos_reembolso.sql`), separada do cadastro geral de
`pessoas` — que continua com leitura livre para qualquer autenticado, usada nos seletores por
todo o app. A policy de RLS de `pessoas_dados_sensiveis` só libera leitura para admin, ordenador
da despesa, ou a própria pessoa dona do dado; escrita é só admin.

Antes de decidir hospedagem definitiva, confirme com o setor jurídico/TI da Câmara se há
exigência de hospedagem em território nacional para dados de servidores públicos.
