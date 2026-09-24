# Publicar na internet

Há duas publicações possíveis, com finalidades diferentes:

| | **Vitrine (GitHub Pages)** | **App completo (Vercel)** |
|---|---|---|
| Para que serve | Mostrar o visual a um cliente | Uso real na loja |
| Totem do cliente | ✅ funciona | ✅ funciona |
| Carrinho + WhatsApp | ✅ funciona | ✅ funciona |
| Painel administrativo | ❌ não vai junto | ✅ funciona |
| Produtos | congelados na publicação | editáveis pelo painel |

---

# A) Vitrine de demonstração (GitHub Pages)

Publicada a partir da branch `main`, pasta `docs/`.

Link: **https://abalduinojose-cmd.github.io/app_viverbem-/**

Os produtos da vitrine são o retrato congelado em `src/lib/dados-demo.json`
(o catálogo de 21/07). A vitrine sai com `noindex`: é uma prévia para o
cliente e não aparece no Google.

### Atualizar a vitrine

Pare o `npm run dev` antes (os dois usam a pasta `.next`):

```bash
npm run demo:build
git add docs && git commit -m "Atualiza a vitrine" && git push
```

Para refazer o retrato a partir do banco atual, use
`npm run demo:build -- --do-banco`.

---

# B) App completo (Vercel) — passo a passo

Coloca o app **inteiro** no ar (totem + painel administrativo), com link
público fixo, sem depender do seu computador ligado.

Tempo estimado: ~15 minutos. Tudo pelo navegador, sem instalar nada.
Você usa apenas a conta do **GitHub que já tem** — o Vercel entra com ela.

> **Por que não GitHub Pages?** O Pages só serve arquivos estáticos. Este
> projeto precisa de servidor (login, cadastro de produtos, upload de fotos,
> banco de dados), então o painel administrativo não funcionaria lá.

O código já está no GitHub: https://github.com/abalduinojose-cmd/app_viverbem-

---

## Passo 1 — Importar o projeto no Vercel

1. Acesse [vercel.com](https://vercel.com) e clique em **Continue with GitHub**.
2. **Add New → Project**.
3. Encontre `app_viverbem-` na lista e clique em **Import**.

Ainda **não clique em Deploy** — falta cadastrar uma variável (Passo 2).

---

## Passo 2 — Cadastrar o segredo de sessão

Ainda na tela de importação, abra **Environment Variables** e cadastre:

| Nome | Valor |
|---|---|
| `SESSION_SECRET` | um texto aleatório com **32+ caracteres** |

Para gerar um valor seguro, rode no seu computador:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Agora sim, clique em **Deploy**. A primeira publicação vai falhar ao abrir
as páginas (ainda não existe banco) — é esperado, resolvemos no Passo 3.

---

## Passo 3 — Criar o banco de dados

O SQLite guarda tudo num arquivo, e a nuvem apaga esse arquivo a cada
publicação. Por isso a versão online usa **PostgreSQL**.

1. No projeto, vá em **Storage → Create Database → Postgres**.
2. Dê um nome (ex.: `viverbem-db`) e escolha a região mais próxima
   (`São Paulo` ou `Washington D.C.`).
3. Clique em **Connect** para ligar ao projeto.

O Vercel cria sozinho a variável `DATABASE_URL`. **Não precisa criar conta
em outro serviço** — o Postgres é provisionado pelo próprio Vercel.

### Criar as tabelas e os dados iniciais

Copie a `DATABASE_URL` (em **Storage → seu banco → `.env.local`**) e rode
no seu computador:

```bash
cd "C:\Users\ABJ PUBLICIDADE\Desktop\ABJ\EXTRA\NK\ANTES E DEPOIS\viverbem-app"

npm run db:postgres                 # troca o schema para PostgreSQL
# cole a DATABASE_URL do Vercel no arquivo .env
npx prisma db push                  # cria as tabelas
npm run db:seed                     # cria os usuários e os 38 produtos

npm run db:sqlite                   # volta o schema para o SQLite local
# e devolva DATABASE_URL="file:./dev.db" no .env
```

> A última linha é importante: ela devolve o seu ambiente local ao SQLite.
> No Vercel isso não afeta nada — o build troca para PostgreSQL sozinho.

---

## Passo 4 — Ativar o envio de fotos

Em servidores serverless o disco é temporário, então as fotos enviadas pelo
painel precisam ir para um armazenamento externo.

1. **Storage → Create Database → Blob**.
2. Clique em **Connect** para ligar ao projeto.
3. **Deployments → ⋯ → Redeploy** para aplicar.

O Vercel cria a variável `BLOB_READ_WRITE_TOKEN`, e o código
(`src/lib/armazenamento.ts`) detecta isso sozinho: com ela, as fotos vão
para a nuvem; sem ela, continuam sendo gravadas em `public/uploads/` como
no seu computador.

---

## Passo 5 — Usar

O Vercel dará um endereço como `https://app-viverbem.vercel.app`.

| Tela | Endereço |
|---|---|
| **Totem (clientes)** | `https://SEU-APP.vercel.app` |
| **Painel administrativo** | `https://SEU-APP.vercel.app/admin` |

No tablet do balcão, abra o endereço do totem e use **"Adicionar à tela
inicial"** para rodar em tela cheia, sem barra do navegador.

### ⚠️ Troque as senhas

As senhas iniciais (`viverbem123` e `operador123`) estão no código do
repositório e **precisam ser trocadas** antes do uso real:

```bash
node -e "console.log(require('bcryptjs').hashSync('SUA_SENHA_NOVA', 10))"
```

Cole o resultado no campo `senhaHash` do usuário. Para editar o banco de
produção, aponte a `DATABASE_URL` para ele e rode `npm run db:studio`.

---

## Publicações seguintes

Depois de configurado é automático: todo `git push` na branch `main`
publica a nova versão sozinho.

```bash
git add -A
git commit -m "descrição da mudança"
git push
```

---

## Se algo der errado

| Sintoma | Causa provável | Solução |
|---|---|---|
| Páginas com erro 500 | Banco não criado | Rode o Passo 3 (`prisma db push` + seed) |
| Catálogo vazio | Seed não rodou | `npm run db:seed` apontando para a `DATABASE_URL` do Vercel |
| Não consigo entrar no painel | `SESSION_SECRET` ausente ou curto | Cadastre com 32+ caracteres e refaça o deploy |
| Foto some após publicar | Blob não conectado | Faça o Passo 4 |
