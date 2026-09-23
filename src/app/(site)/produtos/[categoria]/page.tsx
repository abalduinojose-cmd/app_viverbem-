// Página de uma categoria (ex.: /produtos/dermatologia-estetica). É o
// destino do menu "Categorias" e dos cartões da home.
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { obterCatalogo } from "@/lib/catalogo";
import { infoCategoria } from "@/lib/categorias";
import { CatalogoClient } from "@/components/site/CatalogoClient";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ categoria: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const { categorias } = await obterCatalogo();
  const atual = categorias.find((c) => c.slug === categoria);
  if (!atual) return { title: "Categoria não encontrada" };
  return {
    title: `${atual.nome} · Manipulação Viver Bem`,
    description: infoCategoria(atual.slug).descricao,
  };
}

export default async function PaginaCategoria({ params }: Props) {
  const { categoria } = await params;
  const { categorias, produtos } = await obterCatalogo();
  const atual = categorias.find((c) => c.slug === categoria);
  if (!atual) notFound();

  return (
    <CatalogoClient
      categorias={categorias}
      produtos={produtos.filter((p) => p.categoriaId === atual.id)}
      categoriaAtiva={atual}
    />
  );
}
