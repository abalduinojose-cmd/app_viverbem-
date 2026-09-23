// Clientes captados pelo site (base para marketing e recompra).
// SOMENTE ADMIN (painel do gestor).
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { obterSessao } from "@/lib/sessao";
import { PAPEL_ADMIN } from "@/lib/tipos";
import { ListaClientes } from "@/components/admin/ListaClientes";

export const dynamic = "force-dynamic";

export default async function PaginaClientes() {
  const sessao = await obterSessao();
  if (sessao.papel !== PAPEL_ADMIN) {
    redirect("/admin/produtos");
  }

  const clientes = await db.cliente.findMany({
    orderBy: { criadoEm: "desc" },
    take: 500,
  });

  return (
    <ListaClientes
      clientes={clientes.map((c) => ({
        id: c.id,
        nome: c.nome,
        whatsapp: c.whatsapp,
        pagamento: c.pagamento,
        entrega: c.entrega,
        local: c.local,
        receita: c.receita,
        codigo: c.codigo,
        totalCentavos: c.totalCentavos,
        itens: c.itens,
        criadoEm: c.criadoEm.toISOString(),
      }))}
    />
  );
}
