-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cliente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "itens" TEXT NOT NULL,
    "totalCentavos" INTEGER NOT NULL,
    "pagamento" TEXT NOT NULL,
    "entrega" TEXT NOT NULL DEFAULT '',
    "local" TEXT NOT NULL DEFAULT '',
    "receita" BOOLEAN NOT NULL DEFAULT false,
    "codigo" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Cliente" ("codigo", "criadoEm", "entrega", "id", "itens", "local", "nome", "pagamento", "totalCentavos", "whatsapp") SELECT "codigo", "criadoEm", "entrega", "id", "itens", "local", "nome", "pagamento", "totalCentavos", "whatsapp" FROM "Cliente";
DROP TABLE "Cliente";
ALTER TABLE "new_Cliente" RENAME TO "Cliente";
CREATE TABLE "new_Produto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "precoCentavos" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'PRODUTO',
    "venda" TEXT NOT NULL DEFAULT 'MANIPULADO',
    "aprovado" BOOLEAN NOT NULL DEFAULT true,
    "fotoUrl" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "novidade" BOOLEAN NOT NULL DEFAULT false,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "dosagens" TEXT,
    "composicao" TEXT,
    "modoUso" TEXT,
    "indicacoes" TEXT,
    "apresentacao" TEXT,
    "categoriaId" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Produto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Produto" ("apresentacao", "ativo", "atualizadoEm", "categoriaId", "composicao", "criadoEm", "descricao", "destaque", "dosagens", "fotoUrl", "id", "indicacoes", "modoUso", "nome", "novidade", "ordem", "precoCentavos", "slug", "tipo") SELECT "apresentacao", "ativo", "atualizadoEm", "categoriaId", "composicao", "criadoEm", "descricao", "destaque", "dosagens", "fotoUrl", "id", "indicacoes", "modoUso", "nome", "novidade", "ordem", "precoCentavos", "slug", "tipo" FROM "Produto";
DROP TABLE "Produto";
ALTER TABLE "new_Produto" RENAME TO "Produto";
CREATE UNIQUE INDEX "Produto_slug_key" ON "Produto"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
