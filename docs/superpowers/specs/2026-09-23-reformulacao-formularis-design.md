# Reformulação do site no modelo da Formularis

Especificação aprovada em 23/09/2026, em três partes (navegação e home; categorias,
produto e pedido; A Viver Bem, painel e verificação). Branch: `reformulacao-formularis`.

## Contexto

- **Referência de estrutura:** formularisfarmacia.com.br. Aproveita-se a arquitetura
  (menu com "Enviar receita" na frente, categorias no menu, pilares, "Como funciona",
  seção de personalização, banners de categoria, "Fale com a gente", "Quem somos").
- **O que NÃO vem da referência:** o modelo comercial. A loja da Formularis vende
  manipulado com nome de marca, preço, parcelamento e carrinho, que é o caso punido na
  RE nº 3.547/2026. Também não vem o desenho (preto e branco, molduras finas): a
  referência define estrutura, a execução usa a identidade da Viver Bem.
- **Mantido:** informações, identidade visual, paleta (azul `#1C69B5`, vermelho
  `#E02129`), tipografia (Fraunces + Inter), painel, lojas, avaliações, reels.
- **Restrição:** as orientações já enviadas à cliente depois do PDF "Radar Magistral"
  (RDC 67/2007 itens 5.14 e 5.17.4; RE nº 3.547/2026).

## Decisões

1. **Catálogo:** categorias + receita. Manipulado aparece sem preço e sem carrinho, com
   "Enviar receita". Industrializado com registro na Anvisa aparece com preço e carrinho.
2. **Receita:** formulário curto (retirada ou entrega, nome, WhatsApp) que abre o
   WhatsApp com a mensagem pronta e o código VB-XXXX. O pedido é registrado no painel.
   O site nunca recebe nem guarda a foto da receita (dado de saúde, LGPD).
3. **Home:** segue a sequência da Formularis, encaixando o que só a Viver Bem tem.
4. **Sem linhas decorativas:** o diagrama com linhas da Formularis não entra. A cliente
   reprovou linhas decorativas duas vezes.

## Navegação

- **Menu:** `Enviar receita` (botão, único destaque) · `A Viver Bem` ▾ (Nossa história,
  Como funciona, O que dizem os clientes) · `Categorias` ▾ (as categorias do banco +
  Ver todas) · `Lojas` · `Contato`. Lupa de busca que leva a `/produtos?busca=`.
- **Celular:** logo, lupa e menu. O botão flutuante do carrinho vira "Enviar receita";
  quando há industrializado no pedido, mostra a contagem.

## Home, na ordem

1. **Carrossel** de 3 slides (fotos tiradas dos reels, em `public/fotos/`):
   receita (`manipulacao.webp`) · 19 anos e 3 lojas (`loja.webp`) · entrega de moto ou
   retirada (`preparo.webp`). Troca a cada ~7 s, pausa com mouse ou foco, arrasta no
   celular, fica parado com `prefers-reduced-motion`. Com `public/hero.mp4`, o vídeo vira
   o fundo do primeiro slide.
2. **Pilares:** a faixa de números aprovada pela cliente (19 anos, 3 lojas, 634
   avaliações 5,0). Sai o "100% sob medida" (não comprovável). Sai o `CartaoNumeros`,
   que repetia os mesmos dados.
3. **Como funciona**, 4 passos: envie a receita → o farmacêutico confere e passa o
   valor → manipulação → retirada ou entrega de moto.
4. **Cada pessoa tem sua fórmula:** a seção de receita existente, com texto e botão de
   um lado e 4 cartões do outro.
5. **Categorias:** um cartão por categoria, no lugar dos "Lançamentos".
6. **Pronta entrega:** industrializados com preço. Só aparece quando houver algum.
7. **Entrega e retirada:** a seção da moto (`SecaoDelivery`), com o texto sem carrinho.
8. **Reels do Instagram:** só os reels 1 e 2. O reel 3 mostra "Glow cream" e "Pó
   finalizador" pelo nome e sai do site.
9. **Avaliações do Google.**
10. **Fale com a gente:** o cartão de WhatsApp do topo do rodapé, com o horário.

Saem da home: as faixas de produtos (mais procurados, novidades, vitaminas, dermato,
combos), o banner "nada de dose padrão de fábrica" e a lista com "sem excesso e sem
falta".

## Categorias e produto

- `/produtos`: tudo, agrupado por categoria, com busca (inclusive vinda de `?busca=`).
- `/produtos/[categoria]`: página de cada categoria (destino do menu e da home).
- **Cartão de manipulado:** imagem, categoria, nome, selo "Sob prescrição". Sem preço,
  sem descrição, sem botão.
- **Cartão de industrializado:** foto, nome, preço, botão Adicionar.
- **Combos:** não aparecem no site (continuam no banco, desativados).
- **Página do manipulado:** imagem, nome, categoria, descrição curta, botão Enviar
  receita e a nota "Manipulado mediante prescrição. O farmacêutico confere a receita e
  passa o valor pelo WhatsApp". Não mostra preço, dosagens, indicações, modo de uso,
  apresentação nem selos de novidade/destaque.
- **Página do industrializado:** como hoje (preço, dosagem, quantidade, detalhes).
- **Vistos recentemente:** só links; botão de adicionar apenas em industrializado.
- **Compartilhamento:** a descrição do link de manipulado não leva preço.

## Pedido (o carrinho vira "Seu pedido")

- Abre pelo "Enviar receita" (cabeçalho, botão flutuante, página de produto, home) ou
  pelo Adicionar de um industrializado.
- **Passo 1:** "Vou enviar uma receita" (marcado quando veio de Enviar receita; se veio
  de um produto, "Você viu: [nome]") + lista de industrializados, se houver.
- **Passo 2:** nome, WhatsApp, retirada numa das 3 lojas ou entrega com endereço.
  Pagamento só é pedido quando há industrializado.
- **Envio:** grava o `Cliente` com `receita=true/false` e abre o WhatsApp com a
  mensagem e o código, pedindo a foto da receita. Se a gravação falhar, o WhatsApp abre
  mesmo assim (comportamento atual).
- **API `/api/pedidos`:** aceita pedido sem itens quando `receita=true`; recusa pedido
  sem receita e sem itens.

## A Viver Bem (`/sobre`)

1. Abertura com foto (`laboratorio.webp`) e o texto de história existente.
2. Linhas no formato Missão/Visão/Valores com o que a Viver Bem já tem: Nossa história,
   Como trabalhamos, Onde estamos. Missão, visão e valores não são inventados; se a
   cliente enviar os dela, entram no lugar.
3. Como funciona (`#como-funciona`, antes `#como-pedir`).
4. Avaliações (`#avaliacoes`).

Sai o bloco de diferenciais ("nada de dose padrão de fábrica").

## Painel

- **Tipo de venda** por produto: Manipulado (padrão) ou Industrializado com registro.
- No formulário, manipulado esconde preço, dosagens, indicações, modo de uso,
  apresentação, novidade e destaque, e avisa para usar foto sem marca no rótulo.
- Lista de produtos mostra o tipo de venda; a edição rápida de preço só existe em
  industrializado.
- **Gestor:** faturamento conta só industrializados (pedido só de receita tem total 0);
  novo cartão "Receitas no mês"; alerta "sem preço" só para industrializado; planilha
  de clientes ganha a coluna Receita.
- **Trava do operador:** produto novo cadastrado pelo operador fica "aguardando
  aprovação" e não aparece no site até o gestor publicar. O operador continua ligando e
  desligando o "No site" dos produtos já publicados (item em falta), sem passar pelo
  gestor.

## Dados

- `Produto.venda String @default("MANIPULADO")` (`"MANIPULADO"` | `"INDUSTRIALIZADO"`).
- `Produto.aprovado Boolean @default(true)`: `false` só no produto criado pelo
  operador, até o gestor publicar. O site mostra `ativo && aprovado`.
- `Cliente.receita Boolean @default(false)`.
- Um só conversor `produtoParaDTO` (hoje o mapeamento está repetido em 3 lugares).
- `scripts/aplicar-conformidade.js` (idempotente, identifica pelo slug antigo): nome
  genérico, descrição neutra, slug novo (o site ainda não foi divulgado), imagem neutra
  no lugar das 11 fotos de pote com marca, indicações apagadas, novidade e destaque
  zerados, combos e compostos sem composição desativados.
- `prisma/seed.js` com os mesmos dados, para banco novo (deploy) já nascer certo.
- Registro sem campo `venda` (vitrine demo antiga) é tratado como manipulado.

## Regras de texto (manipulados)

Sem efeito ou resultado; sem comparação com medicamento industrializado; sem nome de
marca ou de fantasia; sem promoção (combo, desconto, "mais procurados", "novidade");
linguagem de prescrição. Ficam registradas em comentário no código, como já está em
`EnviarReceita.tsx`. Revisão final do farmacêutico responsável antes de publicar.

## Nomes genéricos (proposta, a validar pelo farmacêutico)

| Atual | Proposto | Situação |
|---|---|---|
| Creme Facial Ácido Hialurônico | Creme facial com ácido hialurônico | ativo |
| Sérum Vitamina C 10% | Sérum com vitamina C | ativo |
| Gel Redutor de Medidas | Gel corporal | ativo |
| Glow Cream | Creme facial com ceramida e niacinamida | ativo |
| Firm Defense Serum | Sérum com ceramidas e centella | ativo |
| ZincBlock FPS | Protetor solar com óxido de zinco | ativo |
| Bastão Clareador | Bastão com vitamina C | ativo |
| Pó Finalizador FPB 20 | Pó facial finalizador | ativo |
| Protetor Solar Facial FPS 50 | Protetor solar facial | ativo |
| Creme Ácido Retinoico | Creme com ácido retinoico | ativo |
| Colágeno Verisol® 30 doses | Colágeno hidrolisado (Verisol®) | ativo |
| Vitamina D3 | Vitamina D3 | ativo |
| Polivitamínico Energia 30 doses | Polivitamínico | ativo |
| Fórmula Sono Reparador | Fórmula com melatonina, triptofano e magnésio | ativo |
| CitoRepair™ 2.0 | Fórmula com espermidina e resveratrol | ativo |
| Ômega 3 Viver Bem | Ômega 3 com EPA e DHA | ativo |
| VitaFlex | Fórmula com curcumina e colágeno tipo II | ativo |
| Creatina Gummy | Creatina em gomas | ativo |
| Caramelo de Creatina | Caramelo de creatina | ativo |
| Composto Emagrecedor | Fórmula em cápsulas | **desativado**: sem composição, o nome era a promessa |
| Ômega 3 Concentrado | Ômega 3 concentrado | ativo |
| Magnésio Dimalato | Magnésio dimalato | ativo |
| Creatina Monohidratada | Creatina monoidratada | ativo |
| Coenzima Q10 | Coenzima Q10 | ativo |
| Loção Capilar Minoxidil | Loção capilar com minoxidil | ativo |
| Cápsulas Cabelos & Unhas Fortes | Cápsulas com biotina e silício orgânico | ativo |
| Shampoo Antiqueda | Shampoo manipulado | ativo |
| Composto Feminino Equilíbrio | Composto feminino | **desativado**: sem composição |
| Cranberry | Cranberry em cápsulas | ativo |
| Colágeno + Ácido Hialurônico | Colágeno com ácido hialurônico | ativo |
| Composto Masculino Vigor | Composto masculino | **desativado**: sem composição |
| Saw Palmetto | Saw palmetto em cápsulas | ativo |
| Testoviver Homem 45+ | Fórmula com zinco, maca peruana e tribulus | ativo |
| Floral Tranquilidade 30ml | Floral manipulado | ativo |
| Homeopatia Personalizada | Homeopatia personalizada | ativo |
| Combo Pele Radiante, Combo Cabelos Fortes, Combo Imunidade em Dia | (sem mudança) | **desativados** |

Produtos que o farmacêutico classificar como industrializados com registro podem voltar
ao nome e à foto de rótulo.

## Imagens

- `public/fotos/`: `manipulacao.webp` (enchimento de cápsulas), `loja.webp` (atendimento
  na loja), `preparo.webp` (sachês na balança), `laboratorio.webp` (técnica no
  laboratório). Quadros dos reels 1, sem legenda, recortados em 4:5.
- As 11 fotos de pote com marca ficam em `public/uploads/` para uso futuro em
  industrializado, mas saem dos manipulados e do hero.
- Pedir à cliente fotos da loja, do laboratório e da equipe para trocar os quadros.

## Fora do escopo

Classificação real dos produtos (depende do farmacêutico), missão/visão/valores
oficiais, revisão do áudio dos reels 1 e 2, deploy.

## Verificação

1. `next build` e `eslint` sem erro.
2. `scripts/verificar-conformidade.js`: abre a página de cada produto ativo; manipulado
   não pode ter "R$" nem "Escolha a dosagem"; industrializado precisa ter preço.
3. Navegador, em 375 px e desktop: home, categorias, produto de cada tipo (marcando um
   industrializado de teste e desfazendo), pedido com receita, pedido com industrializado,
   painel; sem rolagem horizontal e sem erro no console.
4. `design-review` no fim.

## Ordem de implementação

1. Dados: schema, migração, DTO, script de conformidade, seed.
2. Pedido: contexto do carrinho, gaveta, WhatsApp, API.
3. Catálogo e produto: cartões, `/produtos`, `/produtos/[categoria]`, página do produto.
4. Cabeçalho e rodapé.
5. Home: carrossel, pilares, como funciona, receita, categorias, pronta entrega.
6. A Viver Bem.
7. Painel.
8. Verificação.
