"use client";

import { useMemo, useState } from "react";

type Pessoa = { id: string; nome: string; categoria: string };
type ValorTabela = { tipo: string; faixa: string; categoria: string; valor: number };

type Item = {
  modo: "tabela" | "manual";
  tipo: string;
  faixa: string;
  descricao_manual: string;
  quantidade: number;
  valor_unitario: number;
};

export type ValoresIniciais = {
  numero_diaria: string;
  numero_solicitacao: string;
  municipio_destino: string;
  instituicao_destino: string;
  contato_destino: string;
  data_partida: string;
  data_chegada: string;
  finalidade: string;
  itens: Item[];
};

const TIPOS = [
  { value: "semPernoite", label: "Sem pernoite" },
  { value: "comPernoite", label: "Com pernoite" },
];

function novoItem(): Item {
  return {
    modo: "tabela",
    tipo: "semPernoite",
    faixa: "",
    descricao_manual: "",
    quantidade: 1,
    valor_unitario: 0,
  };
}

export function SolicitacaoForm({
  action,
  pessoas,
  pessoaFixaId,
  tabelaValores,
  valoresIniciais,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  pessoas: Pessoa[];
  pessoaFixaId?: string;
  tabelaValores: ValorTabela[];
  valoresIniciais?: ValoresIniciais;
  submitLabel: string;
}) {
  const [pessoaId, setPessoaId] = useState(pessoaFixaId ?? "");
  const [itens, setItens] = useState<Item[]>(
    valoresIniciais?.itens.length ? valoresIniciais.itens : [novoItem()],
  );

  const pessoaSelecionada = pessoas.find((p) => p.id === pessoaId);

  const faixasPorTipo = useMemo(() => {
    const map: Record<string, string[]> = { semPernoite: [], comPernoite: [] };
    for (const v of tabelaValores) {
      if (!map[v.tipo].includes(v.faixa)) map[v.tipo].push(v.faixa);
    }
    return map;
  }, [tabelaValores]);

  function atualizarItem(index: number, patch: Partial<Item>) {
    setItens((prev) => {
      const next = [...prev];
      const item = { ...next[index], ...patch };

      if (item.modo === "tabela" && pessoaSelecionada) {
        const encontrado = tabelaValores.find(
          (v) =>
            v.tipo === item.tipo &&
            v.faixa === item.faixa &&
            v.categoria === pessoaSelecionada.categoria,
        );
        item.valor_unitario = encontrado?.valor ?? 0;
      }

      next[index] = item;
      return next;
    });
  }

  const total = itens.reduce((acc, item) => acc + item.quantidade * item.valor_unitario, 0);

  return (
    <form action={action} className="mt-6 space-y-6">
      <input
        type="hidden"
        name="itens"
        value={JSON.stringify(
          itens.map((item) => ({
            modo: item.modo,
            categoria: pessoaSelecionada?.categoria,
            tipo: item.modo === "tabela" ? item.tipo : undefined,
            faixa: item.modo === "tabela" ? item.faixa : undefined,
            descricao_manual: item.modo === "manual" ? item.descricao_manual : undefined,
            quantidade: item.quantidade,
            valor_unitario: item.valor_unitario,
          })),
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Solicitante</label>
          {pessoaFixaId ? (
            <>
              <input
                type="hidden"
                name="pessoa_id"
                value={pessoaFixaId}
              />
              <p className="mt-1 rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700">
                {pessoaSelecionada?.nome} ({pessoaSelecionada?.categoria})
              </p>
            </>
          ) : (
            <select
              name="pessoa_id"
              required
              value={pessoaId}
              onChange={(e) => setPessoaId(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Selecione…</option>
              {pessoas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} ({p.categoria})
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Número da diária</label>
          <input
            name="numero_diaria"
            defaultValue={valoresIniciais?.numero_diaria}
            placeholder="ex.: 161"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Número da solicitação</label>
          <input
            name="numero_solicitacao"
            defaultValue={valoresIniciais?.numero_solicitacao}
            placeholder="ex.: 020/2026"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Município/destino</label>
          <input
            name="municipio_destino"
            required
            defaultValue={valoresIniciais?.municipio_destino}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Instituição de destino</label>
          <input
            name="instituicao_destino"
            defaultValue={valoresIniciais?.instituicao_destino}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Contato no destino</label>
          <input
            name="contato_destino"
            defaultValue={valoresIniciais?.contato_destino}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Data de partida</label>
          <input
            type="date"
            name="data_partida"
            defaultValue={valoresIniciais?.data_partida}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Data de chegada</label>
          <input
            type="date"
            name="data_chegada"
            defaultValue={valoresIniciais?.data_chegada}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Finalidade</label>
          <textarea
            name="finalidade"
            required
            rows={3}
            defaultValue={valoresIniciais?.finalidade}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-700">Itens da diária</h2>
          <button
            type="button"
            onClick={() => setItens((prev) => [...prev, novoItem()])}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            + adicionar item
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {itens.map((item, index) => (
            <div key={index} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500">Modo</label>
                  <select
                    value={item.modo}
                    onChange={(e) => atualizarItem(index, { modo: e.target.value as Item["modo"] })}
                    className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  >
                    <option value="tabela">Tabela oficial</option>
                    <option value="manual">Manual (fora da tabela)</option>
                  </select>
                </div>

                {item.modo === "tabela" ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-slate-500">Tipo</label>
                      <select
                        value={item.tipo}
                        onChange={(e) =>
                          atualizarItem(index, { tipo: e.target.value, faixa: "" })
                        }
                        className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                      >
                        {TIPOS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500">Faixa/destino</label>
                      <select
                        value={item.faixa}
                        onChange={(e) => atualizarItem(index, { faixa: e.target.value })}
                        className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                      >
                        <option value="">Selecione…</option>
                        {(faixasPorTipo[item.tipo] ?? []).map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="min-w-[240px] flex-1">
                    <label className="block text-xs font-medium text-slate-500">Descrição</label>
                    <input
                      value={item.descricao_manual}
                      onChange={(e) => atualizarItem(index, { descricao_manual: e.target.value })}
                      placeholder="ex.: Diária internacional (art. 8º-A)"
                      className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-500">Qtd.</label>
                  <input
                    type="number"
                    min={1}
                    value={item.quantidade}
                    onChange={(e) =>
                      atualizarItem(index, { quantidade: Number(e.target.value) || 1 })
                    }
                    className="mt-1 w-20 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500">Valor unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={item.valor_unitario}
                    disabled={item.modo === "tabela"}
                    onChange={(e) =>
                      atualizarItem(index, { valor_unitario: Number(e.target.value) || 0 })
                    }
                    className="mt-1 w-28 rounded-md border border-slate-300 px-2 py-1.5 text-sm disabled:bg-slate-100"
                  />
                </div>

                {itens.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setItens((prev) => prev.filter((_, i) => i !== index))}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    remover
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-3 text-right text-sm font-medium text-slate-900">
          Total: {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>
      </div>

      <button
        type="submit"
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        {submitLabel}
      </button>
    </form>
  );
}
