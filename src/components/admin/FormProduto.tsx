"use client";
// Formulário de produto (usado tanto para criar quanto para editar).
// Faz o upload da foto primeiro (se houver) e depois salva o produto.
//
// Começa pelo TIPO DE VENDA, porque ele decide o que aparece no site:
//   - manipulado: sem preço, sem dosagem, sem indicações e sem selos
//     promocionais; o cliente pede pela receita (RDC 67/2007, item 5.14).
//     Esses campos nem aparecem aqui, para ninguém preencher sem querer;
//   - industrializado com registro na Anvisa: venda normal, com preço.

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CategoriaDTO,
  ProdutoDTO,
  TIPO_PRODUTO,
  VENDA_MANIPULADO,
  VENDA_INDUSTRIALIZADO,
  PAPEL_ADMIN,
} from "@/lib/tipos";
import { centavosParaInput, converterPrecoParaCentavos } from "@/lib/preco";

const classeCampo =
  "border border-grafite/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-royal/50";

const TIPOS_VENDA = [
  {
    valor: VENDA_MANIPULADO,
    titulo: "Manipulado",
    texto: "Aparece sem preço. O cliente envia a receita pelo WhatsApp.",
  },
  {
    valor: VENDA_INDUSTRIALIZADO,
    titulo: "Industrializado com registro",
    texto: "Aparece com preço e carrinho. Só para produto com registro na Anvisa.",
  },
];

function Caixa({
  marcado,
  aoMudar,
  titulo,
  descricaoCurta,
}: {
  marcado: boolean;
  aoMudar: (v: boolean) => void;
  titulo: string;
  descricaoCurta: string;
}) {
  return (
    <label
      className={`flex-1 min-w-40 border rounded-xl p-4 cursor-pointer transition-colors ${
        marcado ? "border-royal bg-royal-claro/60" : "border-grafite/20 bg-white"
      }`}
    >
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={marcado}
          onChange={(e) => aoMudar(e.target.checked)}
          className="w-5 h-5 accent-[#1C69B5]"
        />
        <span className="font-semibold text-grafite">{titulo}</span>
      </div>
      <p className="text-xs text-grafite-claro mt-1">{descricaoCurta}</p>
    </label>
  );
}

export function FormProduto({
  categorias,
  produto, // undefined = criando novo
  papel,
}: {
  categorias: CategoriaDTO[];
  produto?: ProdutoDTO;
  papel: string;
}) {
  const router = useRouter();
  const editando = Boolean(produto);
  const ehGestor = papel === PAPEL_ADMIN;

  const [venda, setVenda] = useState(produto?.venda ?? VENDA_MANIPULADO);
  const [nome, setNome] = useState(produto?.nome ?? "");
  const [descricao, setDescricao] = useState(produto?.descricao ?? "");
  const [preco, setPreco] = useState(
    produto && produto.precoCentavos > 0 ? centavosParaInput(produto.precoCentavos) : ""
  );
  const [categoriaId, setCategoriaId] = useState<string>(
    produto?.categoriaId ? String(produto.categoriaId) : ""
  );
  const [dosagens, setDosagens] = useState(produto?.dosagens ?? "");
  const [apresentacao, setApresentacao] = useState(produto?.apresentacao ?? "");
  const [indicacoes, setIndicacoes] = useState(produto?.indicacoes ?? "");
  const [composicao, setComposicao] = useState(produto?.composicao ?? "");
  const [modoUso, setModoUso] = useState(produto?.modoUso ?? "");
  const [ativo, setAtivo] = useState(produto?.ativo ?? true);
  const [novidade, setNovidade] = useState(produto?.novidade ?? false);
  const [destaque, setDestaque] = useState(produto?.destaque ?? false);
  const [arquivoFoto, setArquivoFoto] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(produto?.fotoUrl ?? null);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const industrializado = venda === VENDA_INDUSTRIALIZADO;

  function escolherFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0] ?? null;
    setArquivoFoto(arquivo);
    if (arquivo) setPreviewFoto(URL.createObjectURL(arquivo));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    // Manipulado não tem preço no site: guarda o que já havia, sem pedir
    let precoCentavos = produto?.precoCentavos ?? 0;
    if (industrializado) {
      const convertido = converterPrecoParaCentavos(preco);
      if (convertido === null || convertido === 0) {
        setErro("Informe o preço no formato 49,90.");
        return;
      }
      precoCentavos = convertido;
    }

    setSalvando(true);
    try {
      // 1) Se o usuário escolheu uma foto nova, envia primeiro
      let fotoUrl = produto?.fotoUrl ?? null;
      if (arquivoFoto) {
        const formulario = new FormData();
        formulario.append("arquivo", arquivoFoto);
        const respostaUpload = await fetch("/api/admin/upload", {
          method: "POST",
          body: formulario,
        });
        const dadosUpload = await respostaUpload.json();
        if (!respostaUpload.ok) {
          setErro(dadosUpload.erro || "Falha no envio da foto.");
          return;
        }
        fotoUrl = dadosUpload.url;
      }

      // 2) Salva o produto (o servidor aplica de novo as regras do manipulado)
      const corpo = {
        nome,
        descricao,
        precoCentavos,
        tipo: produto?.tipo ?? TIPO_PRODUTO,
        venda,
        fotoUrl,
        ativo,
        novidade: industrializado && novidade,
        destaque: industrializado && destaque,
        dosagens: dosagens.trim() || null,
        apresentacao: apresentacao.trim() || null,
        indicacoes: indicacoes.trim() || null,
        composicao: composicao.trim() || null,
        modoUso: modoUso.trim() || null,
        categoriaId: categoriaId ? Number(categoriaId) : null,
      };

      const resposta = await fetch(
        editando ? `/api/admin/produtos/${produto!.id}` : "/api/admin/produtos",
        {
          method: editando ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(corpo),
        }
      );
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados.erro || "Não foi possível salvar.");
        return;
      }

      router.push("/admin/produtos");
      router.refresh();
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={salvar} className="max-w-3xl">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-grafite">
          {editando ? `Editar: ${produto!.nome}` : "Novo produto"}
        </h1>
        {produto && !produto.aprovado && (
          <span className="bg-amber-100 text-amber-800 text-xs font-semibold rounded-full px-3 py-1">
            Aguardando o gestor publicar
          </span>
        )}
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-grafite/10 shadow-sm p-6 flex flex-col gap-5">
        {/* Tipo de venda: decide o que aparece no site */}
        <fieldset>
          <legend className="text-sm font-medium text-grafite">Tipo de venda *</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {TIPOS_VENDA.map((t) => (
              <label
                key={t.valor}
                className={`border rounded-xl p-4 cursor-pointer transition-colors ${
                  venda === t.valor ? "border-royal bg-royal-claro/60" : "border-grafite/20 bg-white hover:border-royal/40"
                }`}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="venda"
                    value={t.valor}
                    checked={venda === t.valor}
                    onChange={() => setVenda(t.valor)}
                    className="w-4 h-4 accent-[#1C69B5]"
                  />
                  <span className="font-semibold text-grafite">{t.titulo}</span>
                </span>
                <span className="block text-xs text-grafite-claro mt-1.5 leading-relaxed">{t.texto}</span>
              </label>
            ))}
          </div>
          {!industrializado && (
            <p className="text-xs text-grafite-medio bg-royal-nevoa rounded-xl px-4 py-3 mt-3 leading-relaxed">
              Manipulado não pode ser exposto como produto à venda. Use nome pela
              composição (sem nome de marca), descreva o que é, sem promessa de efeito, e
              prefira foto sem marca no rótulo.
            </p>
          )}
        </fieldset>

        {/* Foto */}
        <div className="flex items-center gap-5">
          {previewFoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewFoto}
              alt="Foto do produto"
              className="w-28 h-28 rounded-2xl object-cover bg-royal-claro"
            />
          ) : (
            <div className="w-28 h-28 rounded-2xl bg-royal-claro flex items-center justify-center text-grafite-claro text-xs text-center px-2">
              Sem foto
            </div>
          )}
          <label className="cursor-pointer">
            <span className="border border-royal text-royal hover:bg-royal hover:text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors inline-block">
              {previewFoto ? "Trocar foto" : "Enviar foto"}
            </span>
            <input type="file" accept="image/*" onChange={escolherFoto} className="hidden" />
          </label>
        </div>

        {/* Nome */}
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-grafite">Nome *</span>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className={classeCampo}
            placeholder={industrializado ? "Ex.: Protetor solar FPS 50" : "Ex.: Creme com ácido hialurônico"}
          />
        </label>

        {/* Descrição */}
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-grafite">Descrição *</span>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
            rows={3}
            className={`${classeCampo} resize-y`}
            placeholder={
              industrializado
                ? "Descrição curta que aparece no site"
                : "O que é e como é preparado. Ex.: Creme facial com ácido hialurônico, manipulado conforme a prescrição."
            }
          />
        </label>

        <div className={`grid grid-cols-1 gap-4 ${industrializado ? "md:grid-cols-2" : ""}`}>
          {/* Preço: só para quem é vendido com preço */}
          {industrializado && (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-grafite">Preço (R$) *</span>
              <input
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                required
                inputMode="decimal"
                className={classeCampo}
                placeholder="49,90"
              />
            </label>
          )}

          {/* Categoria */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-grafite">Categoria</span>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className={`${classeCampo} bg-white`}
            >
              <option value="">Sem categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </label>
        </div>

        {industrializado && (
          <>
            {/* Dosagens */}
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-grafite">
                Dosagens disponíveis <span className="text-grafite-claro">(opcional)</span>
              </span>
              <input
                value={dosagens}
                onChange={(e) => setDosagens(e.target.value)}
                className={classeCampo}
                placeholder="Separe por vírgula. Ex.: 250mg, 500mg, 1g"
              />
              <span className="text-xs text-grafite-claro">
                Se preencher, o cliente escolhe a dosagem no site antes de adicionar ao pedido.
              </span>
            </label>

            {/* Informações da página do produto */}
            <div className="border-t border-linha pt-5">
              <p className="font-semibold text-grafite">Informações da página do produto</p>
              <p className="text-sm text-grafite-claro mt-0.5">
                Tudo aqui é opcional: o que ficar vazio simplesmente não aparece no site.
                Use o que está no rótulo registrado.
              </p>

              <label className="flex flex-col gap-1.5 mt-4">
                <span className="text-sm font-medium text-grafite">Apresentação</span>
                <input
                  value={apresentacao}
                  onChange={(e) => setApresentacao(e.target.value)}
                  className={classeCampo}
                  placeholder="Ex.: 30 cápsulas · 100ml · Pote 30g"
                />
              </label>

              <label className="flex flex-col gap-1.5 mt-4">
                <span className="text-sm font-medium text-grafite">Indicações</span>
                <textarea
                  value={indicacoes}
                  onChange={(e) => setIndicacoes(e.target.value)}
                  rows={3}
                  className={`${classeCampo} resize-y`}
                  placeholder="Uma por linha, como no rótulo"
                />
              </label>

              <label className="flex flex-col gap-1.5 mt-4">
                <span className="text-sm font-medium text-grafite">Composição</span>
                <textarea
                  value={composicao}
                  onChange={(e) => setComposicao(e.target.value)}
                  rows={3}
                  className={`${classeCampo} resize-y`}
                  placeholder="Um ativo por linha"
                />
              </label>

              <label className="flex flex-col gap-1.5 mt-4">
                <span className="text-sm font-medium text-grafite">Modo de uso</span>
                <textarea
                  value={modoUso}
                  onChange={(e) => setModoUso(e.target.value)}
                  rows={2}
                  className={`${classeCampo} resize-y`}
                  placeholder="Como no rótulo"
                />
              </label>
            </div>
          </>
        )}

        {/* Chaves */}
        <div className="flex flex-wrap gap-3">
          <Caixa
            marcado={ativo}
            aoMudar={setAtivo}
            titulo="Ativo"
            descricaoCurta="Desmarque para esconder do site sem apagar (ex.: item em falta)"
          />
          {industrializado && (
            <>
              <Caixa
                marcado={novidade}
                aoMudar={setNovidade}
                titulo="Novidade"
                descricaoCurta="Ganha o selo de novidade no site"
              />
              <Caixa
                marcado={destaque}
                aoMudar={setDestaque}
                titulo="Destaque"
                descricaoCurta="Aparece primeiro na faixa de pronta entrega da home"
              />
            </>
          )}
        </div>

        {!editando && !ehGestor && (
          <p className="text-sm text-grafite-medio bg-royal-nevoa rounded-xl px-4 py-3">
            Depois de salvar, o produto fica aguardando o gestor conferir e publicar no site.
          </p>
        )}

        {erro && (
          <p className="bg-escarlate/10 text-escarlate text-sm font-medium rounded-xl px-4 py-3">
            {erro}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={salvando}
            className="bg-royal hover:bg-royal-escuro disabled:opacity-60 text-white font-bold rounded-xl px-8 py-3 transition-colors"
          >
            {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Cadastrar produto"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/produtos")}
            className="border border-grafite/30 text-grafite hover:bg-grafite/5 font-semibold rounded-xl px-6 py-3 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </form>
  );
}
