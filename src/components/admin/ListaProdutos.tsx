"use client";
// Gestão de produtos e preços — a tela principal do operador.
// - Cartões em grade com foto, tipo de venda e chaves de exibição no
//   site. Preço editável no lugar só em industrializado: manipulado não
//   tem preço no site (RDC 67/2007, item 5.14)
// - Filtro por texto, por categoria e por situação
// - Resumo no topo (total, no site, em falta, aguardando aprovação)
// - Produto cadastrado pelo operador espera o gestor publicar
// - Reordenar arrastando (só o gestor, com o filtro vazio)

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ProdutoDTO,
  CategoriaDTO,
  TIPO_COMBO,
  PAPEL_ADMIN,
  ehIndustrializado,
} from "@/lib/tipos";
import { formatarPreco, centavosParaInput, converterPrecoParaCentavos } from "@/lib/preco";
import {
  CabecalhoAdmin,
  CartaoNumero,
  Interruptor,
  VazioAdmin,
} from "./PecasAdmin";

type FiltroSituacao = "todos" | "no-site" | "inativos" | "aguardando" | "industrializados";

export function ListaProdutos({
  produtos,
  categorias,
  papel,
}: {
  produtos: ProdutoDTO[];
  categorias: CategoriaDTO[];
  papel: string;
}) {
  const router = useRouter();
  const ehAdmin = papel === PAPEL_ADMIN;
  const [busca, setBusca] = useState("");
  const [situacao, setSituacao] = useState<FiltroSituacao>("todos");
  // "" = todas as categorias; "sem" = produtos sem categoria
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("");
  const [ocupado, setOcupado] = useState<number | null>(null);

  // Edição rápida de preço (id do produto sendo editado)
  const [editandoPreco, setEditandoPreco] = useState<number | null>(null);
  const [precoTexto, setPrecoTexto] = useState("");
  const [erroPreco, setErroPreco] = useState("");

  // Cópia local da lista para o drag-and-drop reordenar na hora
  const [lista, setLista] = useState(produtos);
  useEffect(() => setLista(produtos), [produtos]);

  const listaFiltrada = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return lista.filter((p) => {
      if (termo && !p.nome.toLowerCase().includes(termo)) return false;
      // Filtro por categoria
      if (categoriaFiltro === "sem" && p.categoriaId !== null) return false;
      if (categoriaFiltro && categoriaFiltro !== "sem" && p.categoriaId !== Number(categoriaFiltro))
        return false;
      if (situacao === "no-site") return p.ativo && p.aprovado;
      if (situacao === "inativos") return !p.ativo;
      if (situacao === "aguardando") return !p.aprovado;
      if (situacao === "industrializados") return ehIndustrializado(p);
      return true;
    });
  }, [busca, situacao, categoriaFiltro, lista]);

  // Resumo do topo
  const resumo = useMemo(
    () => ({
      total: lista.length,
      noSite: lista.filter((p) => p.ativo && p.aprovado).length,
      inativos: lista.filter((p) => !p.ativo).length,
      aguardando: lista.filter((p) => !p.aprovado).length,
    }),
    [lista]
  );

  // ---------- Drag-and-drop (admin, sem filtros) ----------
  const podeArrastar =
    ehAdmin && busca.trim() === "" && situacao === "todos" && categoriaFiltro === "";
  const indiceArrastado = useRef<number | null>(null);

  function aoSoltar(indiceDestino: number) {
    const origem = indiceArrastado.current;
    indiceArrastado.current = null;
    if (origem === null || origem === indiceDestino) return;

    const nova = [...lista];
    const [movido] = nova.splice(origem, 1);
    nova.splice(indiceDestino, 0, movido);
    setLista(nova);

    fetch("/api/admin/ordenar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "produtos", ids: nova.map((p) => p.id) }),
    }).then(() => router.refresh());
  }

  // ---------- Ações ----------
  async function alternar(p: ProdutoDTO, campo: "ativo" | "novidade" | "destaque" | "aprovado") {
    setOcupado(p.id);
    try {
      await fetch(`/api/admin/produtos/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [campo]: !p[campo] }),
      });
      router.refresh();
    } finally {
      setOcupado(null);
    }
  }

  // Salva só o preço (edição rápida no card). Manda SÓ o preço: antes
  // mandava o produto pela metade, e a composição, as indicações e o
  // modo de uso sumiam a cada ajuste de preço.
  async function salvarPreco(p: ProdutoDTO) {
    const centavos = converterPrecoParaCentavos(precoTexto);
    if (centavos === null || centavos === 0) {
      setErroPreco("Preço inválido");
      return;
    }
    setOcupado(p.id);
    setErroPreco("");
    try {
      const resposta = await fetch(`/api/admin/produtos/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ precoCentavos: centavos }),
      });
      if (!resposta.ok) {
        setErroPreco("Não foi possível salvar");
        return;
      }
      setEditandoPreco(null);
      router.refresh();
    } finally {
      setOcupado(null);
    }
  }

  async function apagar(p: ProdutoDTO) {
    if (
      !confirm(
        `Apagar "${p.nome}" de vez?\n\nDica: se o produto só está em falta, use o botão "Ativo" para escondê-lo do site sem perder o cadastro.`
      )
    ) {
      return;
    }
    setOcupado(p.id);
    try {
      await fetch(`/api/admin/produtos/${p.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setOcupado(null);
    }
  }

  // ---------- Peças de UI ----------
  const ChipFiltro = ({ valor, children }: { valor: FiltroSituacao; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={() => setSituacao(valor)}
      className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-colors active:scale-95 ${
        situacao === valor
          ? "bg-royal text-white"
          : "bg-white text-grafite-medio border border-linha hover:border-royal/30"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div>
      {/* ---------- Cabeçalho ---------- */}
      <CabecalhoAdmin
        titulo="Produtos e preços"
        descricao="Cadastre, ajuste preços e controle o que aparece no site."
        acao={
          <Link
            href="/admin/produtos/novo"
            className="degrade-marca inline-flex items-center justify-center gap-2 text-white font-semibold rounded-xl px-5 py-3.5 transition-all active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            Novo produto
          </Link>
        }
      />

      {/* ---------- Resumo ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        <CartaoNumero rotulo="Cadastrados" valor={resumo.total} />
        <CartaoNumero rotulo="No site" valor={resumo.noSite} cor="text-royal" />
        <CartaoNumero rotulo="Em falta" valor={resumo.inativos} cor="text-escarlate" />
        <CartaoNumero
          rotulo="Aguardando o gestor"
          valor={resumo.aguardando}
          cor={resumo.aguardando > 0 ? "text-amber-600" : undefined}
        />
      </div>

      {/* ---------- Busca + filtros ---------- */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-60 max-w-sm">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 text-grafite-claro"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto..."
            className="w-full bg-white border border-linha rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-royal/40 focus:border-royal/40"
          />
        </div>
        {/* Filtro por categoria */}
        <div className="relative">
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            aria-label="Filtrar por categoria"
            className="appearance-none bg-white border border-linha rounded-xl pl-4 pr-10 py-3 font-medium text-grafite focus:outline-none focus:ring-2 focus:ring-royal/40 focus:border-royal/40 cursor-pointer"
          >
            <option value="">Todas as categorias</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
            <option value="sem">Sem categoria</option>
          </select>
          <svg
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-grafite-claro pointer-events-none"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="flex gap-2 overflow-x-auto rolagem-sem-barra">
          <ChipFiltro valor="todos">Todos</ChipFiltro>
          <ChipFiltro valor="no-site">No site</ChipFiltro>
          <ChipFiltro valor="inativos">Em falta</ChipFiltro>
          <ChipFiltro valor="aguardando">Aguardando</ChipFiltro>
          <ChipFiltro valor="industrializados">Industrializados</ChipFiltro>
        </div>
      </div>

      {/* Contagem do resultado filtrado */}
      {(busca.trim() !== "" || situacao !== "todos" || categoriaFiltro !== "") && (
        <p className="mt-3 text-sm text-grafite-medio">
          Mostrando <b className="text-grafite">{listaFiltrada.length}</b> de {lista.length} produtos
          <button
            type="button"
            onClick={() => {
              setBusca("");
              setSituacao("todos");
              setCategoriaFiltro("");
            }}
            className="ml-2 text-royal font-semibold hover:underline"
          >
            limpar filtros
          </button>
        </p>
      )}

      {podeArrastar && (
        <p className="mt-3 text-sm text-grafite-claro">
          Arraste os cartões pela alça para mudar a ordem no site.
        </p>
      )}

      {/* ---------- Grade de produtos ---------- */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {listaFiltrada.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-linha">
            <VazioAdmin
              titulo="Nenhum produto encontrado"
              descricao="Tente outro termo de busca ou limpe os filtros."
            />
          </div>
        )}

        {listaFiltrada.map((p, indice) => (
          <div
            key={p.id}
            draggable={podeArrastar}
            onDragStart={() => (indiceArrastado.current = indice)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => aoSoltar(indice)}
            className={`bg-white rounded-2xl border hover:sombra-card overflow-hidden flex flex-col transition-all ${
              p.ativo ? "border-linha" : "border-escarlate/25 bg-escarlate/[0.02]"
            } ${ocupado === p.id ? "opacity-60" : ""}`}
          >
            {/* Topo: foto + nome + preço */}
            <div className="p-4 flex gap-4">
              {podeArrastar && (
                <span
                  className="cursor-grab active:cursor-grabbing text-grafite-claro hover:text-royal select-none -ml-1 mt-1 transition-colors"
                  title="Arraste para reordenar"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" />
                <circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" />
                <circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" />
              </svg>
                </span>
              )}

              <div className="shrink-0 w-20 h-20 rounded-xl bg-royal-nevoa border border-linha overflow-hidden flex items-center justify-center p-1.5">
                {p.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.fotoUrl} alt={p.nome} className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-[0.6rem] text-grafite-claro text-center">sem foto</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <p className="font-semibold text-grafite leading-snug line-clamp-2 flex-1">
                    {p.nome}
                  </p>
                  {p.tipo === TIPO_COMBO && (
                    <span className="shrink-0 bg-royal/10 text-royal text-[0.6rem] font-bold px-2 py-0.5 rounded-full">
                      COMBO
                    </span>
                  )}
                </div>
                <p className="text-xs text-grafite-claro mt-0.5 truncate">
                  {p.categoriaNome ?? "Sem categoria"}
                  {p.dosagens ? ` · ${p.dosagens}` : ""}
                </p>

                {/* Tipo de venda e situação */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span
                    className={`text-[0.65rem] font-semibold rounded-full px-2 py-0.5 ${
                      ehIndustrializado(p) ? "bg-green-50 text-green-700" : "bg-royal-claro text-royal"
                    }`}
                  >
                    {ehIndustrializado(p) ? "Industrializado" : "Manipulado"}
                  </span>
                  {!p.aprovado && (
                    <span className="text-[0.65rem] font-semibold rounded-full px-2 py-0.5 bg-amber-100 text-amber-800">
                      Aguardando o gestor
                    </span>
                  )}
                </div>

                {/* Preço com edição rápida (manipulado não tem preço no site) */}
                {!ehIndustrializado(p) ? (
                  <p className="mt-2 text-sm text-grafite-claro">Sem preço no site, pedido pela receita</p>
                ) : editandoPreco === p.id ? (
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-grafite-claro text-sm">R$</span>
                    <input
                      value={precoTexto}
                      onChange={(e) => setPrecoTexto(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") salvarPreco(p);
                        if (e.key === "Escape") setEditandoPreco(null);
                      }}
                      autoFocus
                      inputMode="decimal"
                      className="w-24 border border-royal/40 rounded-lg px-2 py-1.5 text-lg font-bold text-royal focus:outline-none focus:ring-2 focus:ring-royal/40"
                    />
                    <button
                      type="button"
                      onClick={() => salvarPreco(p)}
                      disabled={ocupado === p.id}
                      aria-label="Salvar preço"
                      className="w-8 h-8 rounded-lg bg-royal text-white flex items-center justify-center disabled:opacity-50"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditandoPreco(null)}
                      aria-label="Cancelar"
                      className="w-8 h-8 rounded-lg bg-grafite/10 text-grafite-medio flex items-center justify-center"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditandoPreco(p.id);
                      setPrecoTexto(centavosParaInput(p.precoCentavos));
                      setErroPreco("");
                    }}
                    title="Clique para alterar o preço"
                    className="group mt-2 inline-flex items-center gap-1.5 text-royal font-bold text-xl tabular-nums hover:text-royal-escuro transition-colors"
                  >
                    {formatarPreco(p.precoCentavos)}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <path
                        d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
                {erroPreco && editandoPreco === p.id && (
                  <p className="text-escarlate text-xs mt-1">{erroPreco}</p>
                )}
              </div>
            </div>

            {/* Chaves de exibição no site */}
            <div className="px-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-linha pt-3 mt-1">
              <Interruptor
                ligado={p.ativo}
                rotulo={p.ativo ? "No site" : "Em falta"}
                aoAlternar={() => alternar(p, "ativo")}
                desabilitado={ocupado === p.id}
                cor="verde"
              />
              {/* Vitrine promocional só existe para industrializado */}
              {ehIndustrializado(p) && (
                <>
                  <Interruptor
                    ligado={p.novidade}
                    rotulo="Novidade"
                    aoAlternar={() => alternar(p, "novidade")}
                    desabilitado={ocupado === p.id}
                    cor="escarlate"
                  />
                  <Interruptor
                    ligado={p.destaque}
                    rotulo="Destaque"
                    aoAlternar={() => alternar(p, "destaque")}
                    desabilitado={ocupado === p.id}
                  />
                </>
              )}
            </div>

            {/* Ações */}
            <div className="p-4 pt-3 mt-auto flex gap-2">
              {/* O gestor publica o que o operador cadastrou */}
              {ehAdmin && !p.aprovado && (
                <button
                  type="button"
                  onClick={() => alternar(p, "aprovado")}
                  disabled={ocupado === p.id}
                  className="flex-1 bg-royal hover:bg-royal-escuro text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors disabled:opacity-50"
                >
                  Publicar
                </button>
              )}
              <Link
                href={`/admin/produtos/${p.id}/editar`}
                className="flex-1 text-center border border-royal text-royal hover:bg-royal hover:text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors"
              >
                Editar
              </Link>
              {ehAdmin && (
                <button
                  type="button"
                  onClick={() => apagar(p)}
                  disabled={ocupado === p.id}
                  aria-label={`Apagar ${p.nome}`}
                  className="w-11 border border-linha text-grafite-claro hover:border-escarlate hover:text-escarlate rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0-.8 12a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 7"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
