// /admin — painel inicial, EXCLUSIVO DO GESTOR.
// O operador não vê números do negócio: cai direto nos produtos.
import Link from "next/link";
import { redirect } from "next/navigation";
import { obterSessao } from "@/lib/sessao";
import { obterMetricas } from "@/lib/metricas";
import { PAPEL_ADMIN } from "@/lib/tipos";
import { formatarPreco } from "@/lib/preco";
import { CabecalhoAdmin } from "@/components/admin/PecasAdmin";
import {
  GraficoFaturamento,
  GraficoPedidosDia,
  GraficoEntregas,
} from "@/components/admin/Graficos";

export const dynamic = "force-dynamic";

function formatarData(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Selo de variação contra o mês passado
function Variacao({ valor }: { valor: number | null }) {
  if (valor === null) return null;
  const subiu = valor > 0;
  const parado = valor === 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5 ${
        parado
          ? "bg-royal-nevoa text-grafite-claro"
          : subiu
            ? "bg-green-50 text-green-700"
            : "bg-escarlate/10 text-escarlate"
      }`}
    >
      {!parado && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d={subiu ? "M12 19V5m0 0-6 6m6-6 6 6" : "M12 5v14m0 0 6-6m-6 6-6-6"}
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {subiu ? "+" : ""}
      {valor}%
    </span>
  );
}

function Cartao({
  rotulo,
  valor,
  apoio,
  variacao,
}: {
  rotulo: string;
  valor: string;
  apoio?: string;
  variacao?: number | null;
}) {
  return (
    <div className="bg-white rounded-2xl border border-linha p-4 md:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[0.65rem] md:text-xs font-semibold tracking-wider uppercase text-grafite-claro leading-tight">
          {rotulo}
        </p>
        {variacao !== undefined && <Variacao valor={variacao} />}
      </div>
      <p className="font-display text-2xl md:text-3xl font-semibold text-grafite tracking-tight mt-2 tabular-nums">
        {valor}
      </p>
      {apoio && <p className="text-grafite-claro text-xs mt-1">{apoio}</p>}
    </div>
  );
}

export default async function PaginaPainel() {
  const sessao = await obterSessao();
  if (sessao.papel !== PAPEL_ADMIN) redirect("/admin/produtos");

  const m = await obterMetricas();
  const mes = new Date().toLocaleDateString("pt-BR", { month: "long" });
  const totalAlertas =
    m.alertas.aguardando +
    m.alertas.inativos +
    m.alertas.semFoto +
    m.alertas.semPreco +
    m.alertas.semCategoria;

  return (
    <div className="max-w-5xl">
      <CabecalhoAdmin
        titulo={`Olá, ${(sessao.nome ?? "").split(" ")[0]}`}
        descricao={`Como está o mês de ${mes} na Viver Bem.`}
      />

      {/* Números do mês */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        <Cartao
          rotulo="Pedidos no mês"
          valor={String(m.pedidosMes)}
          variacao={m.pedidosVariacao}
          apoio={`${m.totalPedidos} desde o início`}
        />
        <Cartao
          rotulo="Receitas no mês"
          valor={String(m.receitasMes)}
          variacao={m.receitasVariacao}
          apoio="pedidos com foto de receita"
        />
        <Cartao
          rotulo="Faturamento"
          valor={formatarPreco(m.faturamentoMes)}
          variacao={m.faturamentoVariacao}
          apoio="só produtos com preço no site"
        />
        <Cartao
          rotulo="Clientes no mês"
          valor={String(m.clientesUnicos)}
          apoio="WhatsApps diferentes"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="bg-white rounded-2xl border border-linha p-5">
          <h2 className="font-semibold text-grafite">Faturamento por mês</h2>
          <p className="text-grafite-claro text-xs mt-0.5">Últimos 6 meses</p>
          <div className="mt-4">
            <GraficoFaturamento dados={m.porMes} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-linha p-5">
          <h2 className="font-semibold text-grafite">Pedidos por dia</h2>
          <p className="text-grafite-claro text-xs mt-0.5">Últimos 14 dias</p>
          <div className="mt-4">
            <GraficoPedidosDia dados={m.porDia} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {/* Mais pedidos */}
        <div className="bg-white rounded-2xl border border-linha p-5">
          <h2 className="font-semibold text-grafite">Produtos com preço mais pedidos</h2>
          {m.maisPedidos.length === 0 ? (
            <p className="text-grafite-claro text-sm mt-3">
              Nenhum produto com preço pedido neste mês. Os pedidos pela receita contam em
              &quot;Receitas no mês&quot;.
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5 mt-4">
              {m.maisPedidos.map((p, i) => {
                const maior = m.maisPedidos[0].quantidade;
                return (
                  <li key={p.nome}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="text-grafite truncate">
                        <span className="text-grafite-claro tabular-nums mr-1.5">{i + 1}.</span>
                        {p.nome}
                      </span>
                      <span className="font-semibold text-grafite tabular-nums shrink-0">
                        {p.quantidade}
                      </span>
                    </div>
                    {/* Barra proporcional ao campeão */}
                    <div className="h-1.5 bg-royal-nevoa rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="h-full degrade-marca rounded-full"
                        style={{ width: `${Math.round((p.quantidade / maior) * 100)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Como os clientes recebem */}
        <div className="bg-white rounded-2xl border border-linha p-5">
          <h2 className="font-semibold text-grafite">Como recebem o pedido</h2>
          <GraficoEntregas entregas={m.entregas} retiradas={m.retiradas} />
        </div>
      </div>

      {/* O que precisa de atenção */}
      <div className="bg-white rounded-2xl border border-linha p-5 mt-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-grafite">O que precisa de atenção</h2>
          <span className="text-xs text-grafite-claro">{m.totalProdutos} produtos</span>
        </div>

        {totalAlertas === 0 ? (
          <p className="text-green-700 bg-green-50 rounded-xl px-4 py-3 text-sm mt-4">
            Catálogo em ordem: nada esperando publicação, e todos os produtos têm foto e
            categoria.
          </p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            {[
              { n: m.alertas.aguardando, r: "aguardando você publicar", grave: true },
              { n: m.alertas.semPreco, r: "industrializados sem preço", grave: true },
              { n: m.alertas.semFoto, r: "sem foto", grave: false },
              { n: m.alertas.semCategoria, r: "sem categoria", grave: false },
              { n: m.alertas.inativos, r: "escondidos do site", grave: false },
            ]
              .filter((a) => a.n > 0)
              .map((a) => (
                <Link
                  key={a.r}
                  href="/admin/produtos"
                  className={`rounded-xl px-4 py-3 border transition-colors ${
                    a.grave
                      ? "border-escarlate/30 bg-escarlate/5 hover:border-escarlate/60"
                      : "border-linha hover:border-royal/40"
                  }`}
                >
                  <p
                    className={`font-display text-2xl font-semibold tabular-nums ${
                      a.grave ? "text-escarlate" : "text-grafite"
                    }`}
                  >
                    {a.n}
                  </p>
                  <p className="text-grafite-medio text-xs mt-0.5">{a.r}</p>
                </Link>
              ))}
          </div>
        )}
      </div>

      {/* Últimos pedidos */}
      <div className="bg-white rounded-2xl border border-linha p-5 mt-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-grafite">Últimos pedidos</h2>
          <Link href="/admin/clientes" className="text-royal text-sm font-medium hover:underline">
            Ver todos
          </Link>
        </div>
        {m.ultimos.length === 0 ? (
          <p className="text-grafite-claro text-sm mt-3">Nenhum pedido registrado ainda.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-linha mt-2">
            {m.ultimos.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-grafite truncate">{p.nome}</p>
                  <p className="text-grafite-claro text-xs tabular-nums">
                    {p.codigo} · {formatarData(p.criadoEm)}
                    {p.entrega ? ` · ${p.entrega}` : ""}
                  </p>
                </div>
                {/* Pedido pela receita ainda não tem valor: é passado depois */}
                <span className="font-semibold text-grafite tabular-nums shrink-0 text-right">
                  {p.receita && (
                    <span className="block text-[0.65rem] font-semibold uppercase tracking-wider text-royal">
                      receita
                    </span>
                  )}
                  {p.totalCentavos > 0 ? formatarPreco(p.totalCentavos) : p.receita ? "a combinar" : formatarPreco(0)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Atalhos do dia a dia. Ficam por último de propósito: o que
          importa nesta tela são os números, não o cadastro. */}
      <div className="mt-4 mb-2">
        <p className="text-[0.65rem] font-semibold tracking-wider uppercase text-grafite-claro px-1">
          Atalhos
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2.5">
          {[
            {
              href: "/admin/produtos/novo",
              titulo: "Novo produto",
              apoio: "cadastrar no catálogo",
              icone: <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
            },
            {
              href: "/admin/produtos",
              titulo: "Ajustar preços",
              apoio: "editar direto na lista",
              icone: (
                <path
                  d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              ),
            },
            {
              href: "/admin/categorias",
              titulo: "Categorias",
              apoio: "agrupar os produtos",
              icone: (
                <>
                  <rect x="3.5" y="4" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <rect x="13.5" y="4" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <rect x="3.5" y="13" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <rect x="13.5" y="13" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8" />
                </>
              ),
            },
          ].map((a) => (
            <Link
              key={a.titulo}
              href={a.href}
              className="group bg-white rounded-2xl border border-linha hover:border-royal/40 px-4 py-3.5 flex items-center gap-3 transition-colors"
            >
              <span className="shrink-0 w-9 h-9 rounded-xl bg-royal-nevoa text-grafite-claro group-hover:bg-royal-claro group-hover:text-royal flex items-center justify-center transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  {a.icone}
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-grafite">{a.titulo}</span>
                <span className="block text-xs text-grafite-claro">{a.apoio}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
