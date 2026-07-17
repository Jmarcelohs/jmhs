import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

// Cliente com a service_role key — só pode ser usado em código
// server-side confiável (server actions), nunca exposto ao navegador.
// Necessário para gerenciar usuários do Supabase Auth (criar, redefinir
// senha, excluir), operações que a anon/authenticated key não alcança.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
