// Consulta do catálogo público, usada por todas as páginas do site
// (home, lista de produtos e página de cada produto).
//
// Em modo DEMO (vitrine estática do GitHub Pages) os dados vêm de um
// "retrato" em JSON, gerado por scripts/gerar-demo.js — assim a vitrine
// funciona sem servidor e sem banco.
import { db } from "@/lib/db";
import {
  CategoriaDTO,
  ProdutoDTO,
  DepoimentoDTO,
  TIPO_COMBO,
  VENDA_MANIPULADO,
  ehIndustrializado,
} from "@/lib/tipos";
import { produtoParaDTO } from "@/lib/produtoDTO";

export interface Catalogo {
  categorias: CategoriaDTO[];
  // Só o que pode aparecer no site: ativo, aprovado pelo gestor e que
  // não seja combo (combo de manipulado é promoção, e promoção de
  // manipulado não pode). Vem com o nome da categoria embutido.
  produtos: ProdutoDTO[];
}

const EH_DEMO = process.env.DEMO === "1";

/** O que de um manipulado pode sair do servidor. O preço interno, a
 *  dosagem, a apresentação e as indicações não vão nem no código da
 *  página: se fossem, apareceriam para quem abrisse o código-fonte,
 *  mesmo sem estar na tela. */
function paraVitrine(p: ProdutoDTO): ProdutoDTO {
  if (ehIndustrializado(p)) return p;
  return {
    ...p,
    precoCentavos: 0,
    novidade: false,
    destaque: false,
    dosagens: null,
    composicao: null,
    modoUso: null,
    indicacoes: null,
    apresentacao: null,
  };
}

/** Carrega o retrato estático usado na vitrine de demonstração. */
async function lerRetratoDemo(): Promise<{
  catalogo: Catalogo;
  avaliacoes: DepoimentoDTO[];
}> {
  const dados = await import("./dados-demo.json");
  return (dados.default ?? dados) as unknown as {
    catalogo: Catalogo;
    avaliacoes: DepoimentoDTO[];
  };
}

export async function obterCatalogo(): Promise<Catalogo> {
  if (EH_DEMO) {
    // O retrato antigo não tem os campos novos: tudo vale como manipulado
    const { catalogo } = await lerRetratoDemo();
    return {
      categorias: catalogo.categorias,
      produtos: catalogo.produtos
        .filter((p) => p.tipo !== TIPO_COMBO)
        .map((p) => paraVitrine({ ...p, venda: p.venda || VENDA_MANIPULADO, aprovado: true })),
    };
  }

  const [categorias, produtos] = await Promise.all([
    db.categoria.findMany({ orderBy: { ordem: "asc" } }),
    db.produto.findMany({
      where: { ativo: true, aprovado: true, NOT: { tipo: TIPO_COMBO } },
      orderBy: [{ ordem: "asc" }, { nome: "asc" }],
      include: { categoria: { select: { nome: true } } },
    }),
  ]);

  return {
    categorias: categorias.map((c) => ({
      id: c.id,
      nome: c.nome,
      slug: c.slug,
      ordem: c.ordem,
    })),
    produtos: produtos.map((p) => paraVitrine(produtoParaDTO(p))),
  };
}

/** Só as categorias, para o menu do cabeçalho (sem carregar produtos). */
export async function obterCategorias(): Promise<CategoriaDTO[]> {
  if (EH_DEMO) {
    return (await lerRetratoDemo()).catalogo.categorias;
  }
  const categorias = await db.categoria.findMany({ orderBy: { ordem: "asc" } });
  return categorias.map((c) => ({ id: c.id, nome: c.nome, slug: c.slug, ordem: c.ordem }));
}

/** Avaliações ativas exibidas na página "Como fazer seu pedido". */
// Só entram no site as avaliações COM foto do cliente: um cartão com
// a inicial no lugar do rosto passa impressão de depoimento inventado.
export async function obterAvaliacoes(): Promise<DepoimentoDTO[]> {
  if (EH_DEMO) {
    return (await lerRetratoDemo()).avaliacoes.filter((a) => Boolean(a.fotoUrl));
  }

  const avaliacoes = await db.depoimento.findMany({
    where: { ativo: true, NOT: { fotoUrl: null } },
    orderBy: { ordem: "asc" },
  });

  return avaliacoes.map((a) => ({
    id: a.id,
    nome: a.nome,
    texto: a.texto,
    nota: a.nota,
    fonte: a.fonte,
    fotoUrl: a.fotoUrl,
    ativo: a.ativo,
    ordem: a.ordem,
  }));
}
