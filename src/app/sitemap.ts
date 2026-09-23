// Sitemap para o Google: páginas fixas, cada categoria e cada produto.
import type { MetadataRoute } from "next";
import { obterCatalogo } from "@/lib/catalogo";

const URL_SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { produtos, categorias } = await obterCatalogo();

  const paginasCategorias: MetadataRoute.Sitemap = categorias
    .filter((c) => produtos.some((p) => p.categoriaId === c.id))
    .map((c) => ({ url: `${URL_SITE}/produtos/${c.slug}`, priority: 0.8 }));

  const fixas: MetadataRoute.Sitemap = [
    { url: `${URL_SITE}/`, priority: 1 },
    { url: `${URL_SITE}/produtos`, priority: 0.9 },
    { url: `${URL_SITE}/sobre`, priority: 0.6 },
    { url: `${URL_SITE}/lojas`, priority: 0.6 },
    { url: `${URL_SITE}/contato`, priority: 0.6 },
  ];

  const paginasProdutos: MetadataRoute.Sitemap = produtos.map((p) => ({
    url: `${URL_SITE}/produto/${p.slug}`,
    priority: 0.8,
  }));

  return [...fixas, ...paginasCategorias, ...paginasProdutos];
}
