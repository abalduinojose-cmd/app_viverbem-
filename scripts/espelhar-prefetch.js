// No export estático do Next 16, o "pré-carregamento" de cada página é
// gravado em subpastas (lojas/__next.!KHNpdGUp/lojas/__PAGE__.txt), mas o
// navegador pede o nome achatado (lojas/__next.!KHNpdGUp.lojas.__PAGE__.txt).
// Num servidor estático puro, como o GitHub Pages, isso vira 404 no console
// e a navegação entre páginas perde a transição instantânea.
//
// Este passo cria, ao lado de cada pasta __next.*, a cópia de cada arquivo
// com o nome achatado. Roda no fim do scripts/gerar-demo.js e também sozinho:
//   node scripts/espelhar-prefetch.js [pasta]   (padrão: docs/)
const fs = require("fs");
const path = require("path");

function arquivosDentro(pasta, prefixo = "") {
  const lista = [];
  for (const item of fs.readdirSync(pasta, { withFileTypes: true })) {
    const relativo = prefixo ? `${prefixo}/${item.name}` : item.name;
    if (item.isDirectory()) lista.push(...arquivosDentro(path.join(pasta, item.name), relativo));
    else lista.push(relativo);
  }
  return lista;
}

function espelharPrefetch(raiz) {
  let copias = 0;
  const visitar = (pasta) => {
    for (const item of fs.readdirSync(pasta, { withFileTypes: true })) {
      if (!item.isDirectory()) continue;
      const caminho = path.join(pasta, item.name);
      if (item.name.startsWith("__next.")) {
        for (const rel of arquivosDentro(caminho)) {
          const achatado = path.join(pasta, `${item.name}.${rel.split("/").join(".")}`);
          if (!fs.existsSync(achatado)) {
            fs.copyFileSync(path.join(caminho, ...rel.split("/")), achatado);
            copias++;
          }
        }
      } else if (item.name !== "_next") {
        visitar(caminho);
      }
    }
  };
  visitar(raiz);
  return copias;
}

module.exports = { espelharPrefetch };

if (require.main === module) {
  const alvo = path.resolve(process.argv[2] || path.join(__dirname, "..", "docs"));
  console.log(`[prefetch] ${espelharPrefetch(alvo)} arquivos espelhados em ${alvo}`);
}
