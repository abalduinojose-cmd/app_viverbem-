// Monta o caminho correto de imagens servidas da pasta public/.
//
// O <Link> e o next/image do Next já lidam sozinhos com o basePath, mas
// as tags <img> comuns (logo e fotos de produto) não — por isso este
// helper. Em produção normal o prefixo é vazio; na vitrine estática do
// GitHub Pages ele vira "/app_viverbem-".

const PREFIXO = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function asset(caminho: string | null | undefined): string {
  if (!caminho) return "";
  // URLs absolutas (ex.: fotos no Vercel Blob) passam direto
  if (/^https?:\/\//.test(caminho)) return caminho;
  // Evita prefixar duas vezes
  if (PREFIXO && caminho.startsWith(PREFIXO)) return caminho;
  return `${PREFIXO}${caminho}`;
}
