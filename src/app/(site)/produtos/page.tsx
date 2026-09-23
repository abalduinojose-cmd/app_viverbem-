// Catálogo completo, agrupado por categoria. A busca do cabeçalho chega
// aqui como ?busca=termo e já abre filtrada.
import type { Metadata } from "next";
import { obterCatalogo } from "@/lib/catalogo";
import { CatalogoClient } from "@/components/site/CatalogoClient";

// Sempre dados frescos do banco (o que muda no painel aparece na hora)
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "O que manipulamos · Manipulação Viver Bem",
  description:
    "Fórmulas manipuladas a partir da receita, separadas por área. Envie a foto da prescrição pelo WhatsApp e retire numa das 3 lojas em Petrópolis ou receba em casa.",
};

export default async function PaginaCatalogo({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string | string[] }>;
}) {
  const [{ categorias, produtos }, parametros] = await Promise.all([obterCatalogo(), searchParams]);
  const busca = Array.isArray(parametros.busca) ? parametros.busca[0] : parametros.busca;

  return (
    // A key remonta o catálogo quando chega uma busca nova pelo cabeçalho
    <CatalogoClient
      key={busca ?? ""}
      categorias={categorias}
      produtos={produtos}
      buscaInicial={(busca ?? "").slice(0, 60)}
    />
  );
}
