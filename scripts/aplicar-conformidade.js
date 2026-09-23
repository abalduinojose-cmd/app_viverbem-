// Aplica ao banco que JÁ EXISTE os nomes genéricos e as descrições
// neutras de prisma/conformidade.js (banco novo já nasce certo pelo seed).
//
//   node scripts/aplicar-conformidade.js
//
// Para cada manipulado: nome e descrição novos, slug novo (o site ainda
// não foi divulgado, então nenhum link antigo quebra), indicações
// apagadas (eram promessa de efeito), novidade e destaque desligados
// (vitrine promocional) e tipo de venda "MANIPULADO".
//
// Pode rodar mais de uma vez: quem já foi convertido não é achado pelo
// slug antigo e fica como está.
const { PrismaClient } = require("@prisma/client");
const conformidade = require("../prisma/conformidade");

const db = new PrismaClient();

// Mesma regra de src/lib/slug.ts
function slugificar(nome) {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function slugLivre(nome, idAtual) {
  const base = slugificar(nome) || "produto";
  let slug = base;
  let n = 2;
  for (;;) {
    const dono = await db.produto.findUnique({ where: { slug }, select: { id: true } });
    if (!dono || dono.id === idAtual) return slug;
    slug = `${base}-${n++}`;
  }
}

(async () => {
  let convertidos = 0;
  let desativados = 0;
  const naoAchados = [];

  for (const [antigo, novo] of Object.entries(conformidade)) {
    const produto = await db.produto.findFirst({
      where: { OR: [{ slug: slugificar(antigo) }, { nome: antigo }] },
    });
    if (!produto) {
      naoAchados.push(antigo);
      continue;
    }

    const dados = {
      venda: "MANIPULADO",
      indicacoes: null,
      novidade: false,
      destaque: false,
    };
    if (novo.nome) {
      dados.nome = novo.nome;
      dados.slug = await slugLivre(novo.nome, produto.id);
    }
    if (novo.descricao) dados.descricao = novo.descricao;
    if (novo.fotoUrl) dados.fotoUrl = novo.fotoUrl;
    if (novo.ativo === false) {
      dados.ativo = false;
      desativados++;
    }

    await db.produto.update({ where: { id: produto.id }, data: dados });
    convertidos++;
    console.log(`  ${antigo}  ->  ${dados.nome ?? antigo}${novo.ativo === false ? "  (fora do site)" : ""}`);
  }

  // Quem não está no mapa (cadastrado depois) só ganha o tipo de venda
  // padrão, se ainda não tiver
  const semTipo = await db.produto.updateMany({
    where: { venda: "" },
    data: { venda: "MANIPULADO" },
  });

  console.log(`\nconvertidos: ${convertidos} | fora do site: ${desativados} | sem tipo corrigidos: ${semTipo.count}`);
  if (naoAchados.length) {
    console.log(`não achados (já convertidos ou inexistentes): ${naoAchados.length}`);
  }
  await db.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
