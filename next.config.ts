import type { NextConfig } from "next";

// DEMO=1 gera a "vitrine estática" publicada no GitHub Pages
// (só o totem do cliente, com os dados congelados em
// src/lib/dados-demo.json). Veja scripts/gerar-demo.js.
const ehDemo = process.env.DEMO === "1";

// No GitHub Pages o site fica em /app_viverbem- (com o hífen do nome do
// repositório), e não na raiz do domínio
const basePath = ehDemo ? "/app_viverbem-" : "";

const nextConfig: NextConfig = {
  // Esconde o indicador de desenvolvimento do Next.js (o botão flutuante
  // no canto da tela) — no totem ele não deve aparecer.
  devIndicators: false,

  // Permite abrir o app em outros aparelhos da mesma rede (tablet do
  // balcão) durante o desenvolvimento. Ajuste o IP se a rede mudar.
  allowedDevOrigins: ["192.168.10.4", "192.168.10.*"],

  ...(ehDemo
    ? {
        output: "export" as const,
        basePath,
        // O Pages não tem o otimizador de imagens do Next
        images: { unoptimized: true },
        // Serve /catalogo como /catalogo/index.html
        trailingSlash: true,
      }
    : {}),

  env: {
    // Usado pelos <img> comuns (logo e fotos) para montar o caminho certo
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
