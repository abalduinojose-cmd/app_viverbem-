"use client";
// Histórico de produtos que a pessoa abriu, guardado no próprio
// navegador (nada vai para o servidor). Serve para ela retomar de
// onde parou e fechar o pedido.
//
// Guardamos só os slugs; os dados vêm do catálogo que a página passa.
// Item industrializado tem "adicionar" direto. Manipulado não tem preço
// nem carrinho, então aparece só como atalho para a página dele.

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProdutoDTO, listarDosagens, ehIndustrializado } from "@/lib/tipos";
import { formatarPreco } from "@/lib/preco";
import { useCarrinho } from "@/lib/carrinho";
import { FotoProduto } from "./FotoProduto";

const CHAVE = "viverbem:vistos";
const LIMITE = 12;

function lerHistorico(): string[] {
  try {
    const bruto = localStorage.getItem(CHAVE);
    const lista = bruto ? JSON.parse(bruto) : [];
    return Array.isArray(lista) ? lista.filter((s) => typeof s === "string") : [];
  } catch {
    // Modo privado ou storage cheio: seguimos sem histórico
    return [];
  }
}

function ItemVisto({ produto }: { produto: ProdutoDTO }) {
  const { adicionar } = useCarrinho();
  const [adicionado, setAdicionado] = useState(false);
  // Com dosagem é preciso escolher, então mandamos para a página
  const precisaEscolher = listarDosagens(produto.dosagens).length > 0;

  function aoAdicionar() {
    adicionar({
      produtoId: produto.id,
      nome: produto.nome,
      precoCentavos: produto.precoCentavos,
      dosagem: null,
      fotoUrl: produto.fotoUrl,
    });
    setAdicionado(true);
    window.setTimeout(() => setAdicionado(false), 1800);
  }

  return (
    <div className="shrink-0 w-[15rem] md:w-[17rem] snap-start bg-white border border-linha rounded-2xl p-3 flex gap-3 hover:sombra-card transition-shadow">
      <Link
        href={`/produto/${produto.slug}`}
        className="shrink-0 w-16 h-16 rounded-xl bg-royal-nevoa overflow-hidden flex items-center justify-center p-1.5"
      >
        <FotoProduto
          fotoUrl={produto.fotoUrl}
          nome={produto.nome}
          className="max-w-full max-h-full !object-contain"
        />
      </Link>

      <div className="min-w-0 flex-1 flex flex-col">
        <Link href={`/produto/${produto.slug}`} className="min-w-0">
          <p className="text-sm font-semibold text-grafite leading-snug line-clamp-2 hover:text-royal transition-colors">
            {produto.nome}
          </p>
        </Link>
        {!ehIndustrializado(produto) ? (
          <p className="text-xs text-grafite-claro mt-auto pt-2">Sob prescrição</p>
        ) : (
          <div className="flex items-center justify-between gap-2 mt-auto pt-2">
            <span className="text-royal font-bold tabular-nums">
              {formatarPreco(produto.precoCentavos)}
            </span>

            {precisaEscolher ? (
              <Link
                href={`/produto/${produto.slug}`}
                className="text-xs font-semibold text-royal border border-linha hover:border-royal/40 rounded-lg px-2.5 py-1.5 transition-colors"
              >
                Escolher
              </Link>
            ) : (
              <button
                type="button"
                onClick={aoAdicionar}
                aria-label={`Adicionar ${produto.nome} ao pedido`}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
                  adicionado
                    ? "bg-green-600 text-white"
                    : "bg-royal-claro text-royal hover:bg-royal hover:text-white"
                }`}
              >
                {adicionado ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function VistosRecentemente({
  slugAtual,
  catalogo,
}: {
  slugAtual: string;
  catalogo: ProdutoDTO[];
}) {
  const [vistos, setVistos] = useState<ProdutoDTO[]>([]);

  useEffect(() => {
    const anteriores = lerHistorico();

    // Mostra o que a pessoa já tinha visto ANTES de abrir esta página
    const porSlug = new Map(catalogo.map((p) => [p.slug, p]));
    setVistos(
      anteriores
        .filter((s) => s !== slugAtual)
        .map((s) => porSlug.get(s))
        .filter((p): p is ProdutoDTO => Boolean(p))
    );

    // E registra o produto atual no topo da lista
    try {
      const atualizado = [slugAtual, ...anteriores.filter((s) => s !== slugAtual)];
      localStorage.setItem(CHAVE, JSON.stringify(atualizado.slice(0, LIMITE)));
    } catch {
      // Sem storage não dá para lembrar, e tudo bem
    }
  }, [slugAtual, catalogo]);

  if (vistos.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-8 pt-10 pb-4">
      <div className="bg-royal-nevoa border border-linha rounded-[1.75rem] px-5 md:px-7 py-6">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <p className="selo-secao text-royal">continue de onde parou</p>
            <h2 className="font-display text-xl md:text-2xl font-semibold text-grafite mt-1">
              Você viu recentemente
            </h2>
          </div>
          <span className="hidden sm:block text-grafite-claro text-sm">
            {vistos.length} {vistos.length === 1 ? "produto" : "produtos"}
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto rolagem-sem-barra snap-x -mx-1 px-1 pb-1">
          {vistos.map((p) => (
            <ItemVisto key={p.id} produto={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
