// POST /api/admin/produtos — cria um produto.
// Permissão: qualquer usuário logado (admin ou operador).
//
// Produto criado pelo OPERADOR nasce aguardando aprovação: só aparece
// no site depois que o gestor publicar. É quem revisa a peça antes de
// ela entrar no ar (farmácia de manipulação responde pelo que publica).
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exigirSessaoApi } from "@/lib/sessao";
import { validarCorpoProduto } from "@/lib/validarProduto";
import { registrarLog } from "@/lib/log";
import { formatarPreco } from "@/lib/preco";
import { gerarSlugProdutoUnico } from "@/lib/slug";
import { PAPEL_ADMIN, VENDA_INDUSTRIALIZADO } from "@/lib/tipos";

export async function POST(req: Request) {
  const sessao = await exigirSessaoApi();
  if (!sessao) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const corpo = await req.json().catch(() => ({}));
  const resultado = validarCorpoProduto(corpo);
  if ("erro" in resultado) {
    return NextResponse.json({ erro: resultado.erro }, { status: 400 });
  }

  // O slug (endereço do produto no site) é gerado UMA vez, no cadastro,
  // e não muda depois: os links postados no Instagram continuam válidos.
  const slug = await gerarSlugProdutoUnico(resultado.dados.nome);
  const aprovado = sessao.papel === PAPEL_ADMIN;
  const produto = await db.produto.create({ data: { ...resultado.dados, slug, aprovado } });

  const preco =
    produto.venda === VENDA_INDUSTRIALIZADO ? ` (${formatarPreco(produto.precoCentavos)})` : " (manipulado)";
  await registrarLog(
    sessao.nome ?? "?",
    "criou produto",
    `"${produto.nome}"${preco}${aprovado ? "" : ", aguardando aprovação"}`
  );
  return NextResponse.json(produto, { status: 201 });
}
