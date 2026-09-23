// POST /api/pedidos — registra o cliente e o resumo do pedido no momento
// da finalização (antes de abrir o WhatsApp). É a base de clientes para
// marketing e recompra, exibida no painel do gestor.
//
// Rota pública (o cliente do site não tem login). Validação simples e
// nenhum dado sensível além de nome e WhatsApp, com consentimento
// informado na tela de finalização (LGPD). A foto da receita NUNCA
// passa por aqui: só a marcação de que ela vai chegar pelo WhatsApp.
//
// Um pedido pode ser só a receita (manipulado, sem itens nem preço),
// só itens industrializados, ou os dois juntos.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const corpo = await req.json().catch(() => ({}));

  const nome = String(corpo.nome ?? "").trim().slice(0, 120);
  const whatsapp = String(corpo.whatsapp ?? "").trim().slice(0, 30);
  const pagamento = String(corpo.pagamento ?? "").trim().slice(0, 40);
  const entrega = String(corpo.entrega ?? "").trim().slice(0, 40);
  const local = String(corpo.local ?? "").trim().slice(0, 200);
  const codigo = String(corpo.codigo ?? "").trim().slice(0, 12);
  const receita = corpo.receita === true;
  const itens = Array.isArray(corpo.itens) ? corpo.itens : [];

  // Sem receita e sem itens não há pedido
  if (!nome || whatsapp.replace(/\D/g, "").length < 10 || (!receita && itens.length === 0)) {
    return NextResponse.json({ erro: "Dados incompletos." }, { status: 400 });
  }

  // Guarda só o essencial de cada item (nada de dados do navegador)
  const itensLimpos = itens.slice(0, 60).map((i: Record<string, unknown>) => ({
    nome: String(i.nome ?? "").slice(0, 120),
    dosagem: i.dosagem ? String(i.dosagem).slice(0, 40) : null,
    quantidade: Number(i.quantidade) || 1,
    precoCentavos: Number(i.precoCentavos) || 0,
  }));

  // O total é refeito aqui a partir dos itens, em vez de confiar no
  // número que veio do navegador. Pedido só de receita fica em zero:
  // o valor do manipulado é passado depois, pelo farmacêutico.
  const totalCentavos = itensLimpos.reduce(
    (soma: number, i: { precoCentavos: number; quantidade: number }) =>
      soma + i.precoCentavos * i.quantidade,
    0
  );

  await db.cliente.create({
    data: {
      nome,
      whatsapp,
      pagamento,
      entrega,
      local,
      codigo,
      receita,
      totalCentavos,
      itens: JSON.stringify(itensLimpos),
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
