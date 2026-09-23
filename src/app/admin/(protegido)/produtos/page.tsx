// Listagem de produtos do painel (carrega tudo no servidor).
// Passa o papel do usuário para o cliente: operador não vê "Apagar",
// não reordena e não publica o que cadastrou (isso é do gestor).
// As categorias alimentam o filtro por categoria.
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/sessao";
import { produtoParaDTO } from "@/lib/produtoDTO";
import { ListaProdutos } from "@/components/admin/ListaProdutos";

export const dynamic = "force-dynamic";

export default async function PaginaProdutos() {
  const [produtos, categorias, sessao] = await Promise.all([
    db.produto.findMany({
      orderBy: [{ ordem: "asc" }, { nome: "asc" }],
      include: { categoria: { select: { nome: true } } },
    }),
    db.categoria.findMany({ orderBy: { ordem: "asc" } }),
    obterSessao(),
  ]);

  return (
    <ListaProdutos
      papel={sessao.papel ?? "OPERADOR"}
      categorias={categorias.map((c) => ({
        id: c.id,
        nome: c.nome,
        slug: c.slug,
        ordem: c.ordem,
      }))}
      produtos={produtos.map(produtoParaDTO)}
    />
  );
}
