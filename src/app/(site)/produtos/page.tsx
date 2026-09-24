// Catálogo completo, agrupado por categoria. A busca do cabeçalho chega
// aqui como ?busca=termo e já abre filtrada.
import type { Metadata } from "next";
import { obterCatalogo } from "@/lib/catalogo";
import { CatalogoClient } from "@/components/site/CatalogoClient";

// Sempre dados frescos do banco (o que muda no painel aparece na hora)
export const dynamic = "force-dynamic";

// Na vitrine estática (GitHub Pages) não há servidor para ler ?busca=:
// lá o próprio catálogo lê o endereço, no navegador
const EH_DEMO = process.env.DEMO === "1";

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
  const { categorias, produtos } = await obterCatalogo();
  const parametros = EH_DEMO ? {} : await searchParams;
  const bruto = "busca" in parametros ? parametros.busca : undefined;
  const busca = (Array.isArray(bruto) ? bruto[0] : bruto) ?? "";

  return (
    // A key remonta o catálogo quando chega uma busca nova pelo cabeçalho
    <CatalogoClient
      key={busca}
      categorias={categorias}
      produtos={produtos}
      buscaInicial={busca.slice(0, 60)}
    />
  );
}
