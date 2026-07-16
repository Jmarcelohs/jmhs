// Tipos gerados manualmente a partir de supabase/migrations/0001_schema.sql.
// Quando o projeto Supabase estiver criado, prefira regenerar com:
//   npx supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts

export type Papel =
  | "admin"
  | "servidor"
  | "ordenador_despesa"
  | "tesoureiro"
  | "controle_interno";

export type Categoria = "Efetivo" | "Comissionado" | "Vereador";

export type StatusDiaria = "Solicitado" | "Autorizado" | "Indeferido";

export type ModoItemDiaria = "tabela" | "manual";

export type TipoDiaria = "semPernoite" | "comPernoite";

export type Parecer =
  | "aprovacao_sem_ressalvas"
  | "aprovacao_com_ressalvas"
  | "reprovacao";

export type TipoAnexo = "imagem" | "pdf";

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          auth_user_id: string | null;
          nome: string;
          email: string;
          papel: Papel;
          ativo: boolean;
          criado_em: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["usuarios"]["Row"], "id">> & {
          nome: string;
          email: string;
          papel: Papel;
        };
        Update: Partial<Database["public"]["Tables"]["usuarios"]["Row"]>;
        Relationships: [];
      };
      pessoas: {
        Row: {
          id: string;
          matricula: string | null;
          nome: string;
          cargo: string;
          categoria: Categoria;
          usuario_id: string | null;
          ativo: boolean;
          criado_em: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["pessoas"]["Row"], "id">> & {
          nome: string;
          cargo: string;
          categoria: Categoria;
        };
        Update: Partial<Database["public"]["Tables"]["pessoas"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "pessoas_usuario_id_fkey";
            columns: ["usuario_id"];
            isOneToOne: false;
            referencedRelation: "usuarios";
            referencedColumns: ["id"];
          },
        ];
      };
      diarias_tabela_valores: {
        Row: {
          id: string;
          portaria: string;
          vigente_desde: string;
          tipo: TipoDiaria;
          faixa: string;
          categoria: Categoria;
          valor: number;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["diarias_tabela_valores"]["Row"], "id">> & {
          portaria: string;
          vigente_desde: string;
          tipo: TipoDiaria;
          faixa: string;
          categoria: Categoria;
          valor: number;
        };
        Update: Partial<Database["public"]["Tables"]["diarias_tabela_valores"]["Row"]>;
        Relationships: [];
      };
      diarias_solicitacoes: {
        Row: {
          id: string;
          pessoa_id: string;
          numero_diaria: string | null;
          numero_solicitacao: string | null;
          fundamento_legal: string;
          data_solicitacao: string | null;
          data_partida: string | null;
          data_chegada: string | null;
          municipio_origem: string;
          municipio_destino: string | null;
          instituicao_destino: string | null;
          contato_destino: string | null;
          finalidade: string | null;
          ordenador_despesa: string;
          status: StatusDiaria;
          data_autorizacao: string | null;
          total: number;
          criado_por: string | null;
          criado_em: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["diarias_solicitacoes"]["Row"], "id">> & {
          pessoa_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["diarias_solicitacoes"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "diarias_solicitacoes_pessoa_id_fkey";
            columns: ["pessoa_id"];
            isOneToOne: false;
            referencedRelation: "pessoas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "diarias_solicitacoes_criado_por_fkey";
            columns: ["criado_por"];
            isOneToOne: false;
            referencedRelation: "usuarios";
            referencedColumns: ["id"];
          },
        ];
      };
      diarias_itens: {
        Row: {
          id: string;
          solicitacao_id: string;
          modo: ModoItemDiaria;
          categoria: Categoria | null;
          tipo: TipoDiaria | null;
          faixa: string | null;
          descricao_manual: string | null;
          quantidade: number;
          valor_unitario: number;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["diarias_itens"]["Row"], "id">> & {
          solicitacao_id: string;
          modo: ModoItemDiaria;
        };
        Update: Partial<Database["public"]["Tables"]["diarias_itens"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "diarias_itens_solicitacao_id_fkey";
            columns: ["solicitacao_id"];
            isOneToOne: false;
            referencedRelation: "diarias_solicitacoes";
            referencedColumns: ["id"];
          },
        ];
      };
      diarias_prestacoes_contas: {
        Row: {
          id: string;
          solicitacao_id: string | null;
          pessoa_id: string;
          numero_solicitacao: string | null;
          fundamento_legal: string;
          data_solicitacao: string | null;
          data_partida: string | null;
          data_chegada: string | null;
          relatorio_resultado: string | null;
          debito_diarias_previstas: number;
          debito_diarias_nao_previstas: number;
          debito_transporte_aereo: number;
          debito_transporte_urbano: number;
          credito_recebidas_antecipadamente: number;
          credito_reembolsar: number;
          credito_transporte_urbano: number;
          credito_devolver: number;
          total_debito: number;
          total_credito: number;
          data_autenticacao_beneficiario: string | null;
          ordenador_despesa: string;
          data_aprovacao_ordenador: string | null;
          tesoureiro_nome: string | null;
          parecer: Parecer | null;
          parecer_observacao: string | null;
          parecer_data: string | null;
          controle_interno_nome: string;
          controle_interno_cargo: string;
          criado_por: string | null;
          criado_em: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["diarias_prestacoes_contas"]["Row"], "id">> & {
          pessoa_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["diarias_prestacoes_contas"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "diarias_prestacoes_contas_solicitacao_id_fkey";
            columns: ["solicitacao_id"];
            isOneToOne: false;
            referencedRelation: "diarias_solicitacoes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "diarias_prestacoes_contas_pessoa_id_fkey";
            columns: ["pessoa_id"];
            isOneToOne: false;
            referencedRelation: "pessoas";
            referencedColumns: ["id"];
          },
        ];
      };
      diarias_prestacoes_pagamentos: {
        Row: {
          id: string;
          prestacao_id: string;
          numero_processo: string | null;
          valor: number;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["diarias_prestacoes_pagamentos"]["Row"], "id">> & {
          prestacao_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["diarias_prestacoes_pagamentos"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "diarias_prestacoes_pagamentos_prestacao_id_fkey";
            columns: ["prestacao_id"];
            isOneToOne: false;
            referencedRelation: "diarias_prestacoes_contas";
            referencedColumns: ["id"];
          },
        ];
      };
      diarias_prestacoes_anexos: {
        Row: {
          id: string;
          prestacao_id: string;
          caminho: string;
          nome_original: string;
          tipo: TipoAnexo;
          criado_por: string | null;
          criado_em: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["diarias_prestacoes_anexos"]["Row"], "id">> & {
          prestacao_id: string;
          caminho: string;
          nome_original: string;
          tipo: TipoAnexo;
        };
        Update: Partial<Database["public"]["Tables"]["diarias_prestacoes_anexos"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "diarias_prestacoes_anexos_prestacao_id_fkey";
            columns: ["prestacao_id"];
            isOneToOne: false;
            referencedRelation: "diarias_prestacoes_contas";
            referencedColumns: ["id"];
          },
        ];
      };
      requerimentos: {
        Row: {
          id: string;
          pessoa_id: string;
          categoria: "RH" | "Ao Presidente" | "Geral" | null;
          conteudo: string | null;
          status: string;
          autorizado_por: string | null;
          data_autorizacao: string | null;
          criado_em: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["requerimentos"]["Row"], "id">> & {
          pessoa_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["requerimentos"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "requerimentos_pessoa_id_fkey";
            columns: ["pessoa_id"];
            isOneToOne: false;
            referencedRelation: "pessoas";
            referencedColumns: ["id"];
          },
        ];
      };
      emendas_impositivas: {
        Row: {
          id: string;
          vereador_id: string | null;
          entidade: string | null;
          secretaria: string | null;
          valor: number | null;
          ano_loa: number;
          status: string;
          criado_em: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["emendas_impositivas"]["Row"], "id">>;
        Update: Partial<Database["public"]["Tables"]["emendas_impositivas"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "emendas_impositivas_vereador_id_fkey";
            columns: ["vereador_id"];
            isOneToOne: false;
            referencedRelation: "pessoas";
            referencedColumns: ["id"];
          },
        ];
      };
      veiculos_solicitacoes: {
        Row: {
          id: string;
          pessoa_id: string;
          numero_solicitacao: string | null;
          data_uso: string | null;
          destino: string | null;
          finalidade: string | null;
          status: string;
          criado_em: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["veiculos_solicitacoes"]["Row"], "id">> & {
          pessoa_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["veiculos_solicitacoes"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "veiculos_solicitacoes_pessoa_id_fkey";
            columns: ["pessoa_id"];
            isOneToOne: false;
            referencedRelation: "pessoas";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
