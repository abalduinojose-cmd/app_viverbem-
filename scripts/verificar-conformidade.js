// Confere, com o site rodando, se nenhum manipulado aparece como
// produto de prateleira (RDC 67/2007, item 5.14; RE nº 3.547/2026).
//
//   node scripts/verificar-conformidade.js [http://localhost:3000]
//
// Para cada produto no site:
//   - manipulado: a página não pode mostrar preço, escolha de dosagem
//     nem botão de adicionar; e o código da página não pode levar o
//     preço interno dele;
//   - industrializado: a página precisa mostrar o preço.
// Nas páginas gerais (home, categorias, sobre, lojas, contato): nenhum
// nome de marca antigo, e nenhum preço de manipulado no código.
// Sai com código 1 se achar qualquer problema.
const { PrismaClient } = require("@prisma/client");

const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const db = new PrismaClient();

// Nomes de fantasia e promessas que não podem voltar para o site
const PROIBIDOS = [
  "VitaFlex",
  "CitoRepair",
  "Testoviver",
  "Glow Cream",
  "ZincBlock",
  "Firm Defense",
  "Emagrecedor",
  "Sono Reparador",
  "Gummy",
  "Combo",
  "Mais procurados",
  "dose padrão",
  "sem excesso",
];

// Texto que a pessoa vê: sem scripts, estilos e tags
function textoVisivel(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");
}

// No código da página (payload do React), acha manipulado com preço.
// A ordem das chaves é a de src/lib/produtoDTO.ts.
function manipuladosComPreco(html) {
  const achados = [];
  const re = /precoCentavos\\?":(\d+),\\?"tipo\\?":\\?"[A-Z]+\\?",\\?"venda\\?":\\?"MANIPULADO/g;
  let m;
  while ((m = re.exec(html))) {
    if (Number(m[1]) > 0) achados.push(Number(m[1]));
  }
  return achados;
}

async function baixar(caminho) {
  const resposta = await fetch(BASE + caminho);
  return { status: resposta.status, html: await resposta.text() };
}

(async () => {
  const problemas = [];
  const produtos = await db.produto.findMany({
    where: { ativo: true, aprovado: true, NOT: { tipo: "COMBO" } },
    select: { nome: true, slug: true, venda: true },
  });
  const categorias = await db.categoria.findMany({ select: { slug: true } });
  const industrializados = produtos.filter((p) => p.venda === "INDUSTRIALIZADO").length;

  // ---------- Páginas de produto ----------
  for (const p of produtos) {
    const { status, html } = await baixar(`/produto/${p.slug}`);
    if (status !== 200) {
      problemas.push(`${p.slug}: HTTP ${status}`);
      continue;
    }
    const texto = textoVisivel(html);
    if (p.venda === "INDUSTRIALIZADO") {
      if (!texto.includes("R$")) problemas.push(`${p.nome}: industrializado sem preço na página`);
    } else {
      if (texto.includes("R$") && industrializados === 0) problemas.push(`${p.nome}: mostra preço`);
      if (texto.includes("Escolha a dosagem")) problemas.push(`${p.nome}: tem escolha de dosagem`);
      if (texto.includes("Adicionar ao pedido")) problemas.push(`${p.nome}: tem botão de adicionar`);
      if (!texto.includes("Enviar receita")) problemas.push(`${p.nome}: sem o botão Enviar receita`);
    }
    const vazados = manipuladosComPreco(html);
    if (vazados.length) problemas.push(`${p.slug}: código da página leva preço de manipulado (${vazados.length})`);
  }

  // ---------- Páginas gerais ----------
  const gerais = ["/", "/produtos", "/sobre", "/lojas", "/contato", ...categorias.map((c) => `/produtos/${c.slug}`)];
  for (const caminho of gerais) {
    const { status, html } = await baixar(caminho);
    if (status !== 200) {
      // Categoria sem produto no site ainda responde 200; outro código é erro
      problemas.push(`${caminho}: HTTP ${status}`);
      continue;
    }
    const texto = textoVisivel(html);
    for (const termo of PROIBIDOS) {
      if (texto.toLowerCase().includes(termo.toLowerCase())) problemas.push(`${caminho}: aparece "${termo}"`);
    }
    if (industrializados === 0 && texto.includes("R$")) problemas.push(`${caminho}: mostra preço sem ter industrializado`);
    const vazados = manipuladosComPreco(html);
    if (vazados.length) problemas.push(`${caminho}: código da página leva preço de manipulado (${vazados.length})`);
  }

  console.log(
    `produtos conferidos: ${produtos.length} (${industrializados} industrializados) | páginas gerais: ${gerais.length}`
  );
  if (problemas.length) {
    console.log(`\n${problemas.length} problema(s):`);
    for (const p of problemas) console.log("  - " + p);
    process.exitCode = 1;
  } else {
    console.log("tudo conforme");
  }
  await db.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
