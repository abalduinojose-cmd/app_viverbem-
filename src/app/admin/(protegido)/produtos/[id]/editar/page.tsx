// Edição de um produto existente.
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/sessao";
import { produtoParaDTO } from "@/lib/produtoDTO";
import { FormProduto } from "@/components/admin/FormProduto";

export const dynamic = "force-dynamic";

export default async function PaginaEditarProduto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [produto, categorias, sessao] = await Promise.all([
    db.produto.findUnique({ where: { id: Number(id) } }),
    db.categoria.findMany({ orderBy: { ordem: "asc" } }),
    obterSessao(),
  ]);

  if (!produto) notFound();

  return (
    <FormProduto categorias={categorias} produto={produtoParaDTO(produto)} papel={sessao.papel ?? "OPERADOR"} />
  );
}
