import type { NextConfig } from "next";

// DEMO=1 gera a "vitrine estática" publicada no GitHub Pages
// (só o site do cliente, com os dados congelados em
// src/lib/dados-demo.json). Veja scripts/gerar-demo.js.
const ehDemo = process.env.DEMO === "1";

// No GitHub Pages o site fica em /app_viverbem-, e não na raiz do
// domínio (o hífen final faz parte do nome do repositório)
const basePath = ehDemo ? process.env.DEMO_BASE_PATH || "/app_viverbem-" : "";

// A prévia precisa do próprio endereço: sem ele o link compartilhado no
// WhatsApp sai sem imagem e o canonical aponta para um domínio que não existe
const urlDemo = `https://abalduinojose-cmd.github.io${basePath}`;

const nextConfig: NextConfig = {
  // Esconde o indicador de desenvolvimento do Next.js (o botão flutuante
  // no canto da tela)
  devIndicators: false,

  // Permite abrir o app em outros aparelhos da mesma rede durante o
  // desenvolvimento. Ajuste o IP se a rede mudar.
  allowedDevOrigins: ["192.168.10.4", "192.168.10.*"],

  ...(ehDemo
    ? {
        output: "export" as const,
        basePath,
        // O Pages não tem o otimizador de imagens do Next
        images: { unoptimized: true },
        // Serve /produtos como /produtos/index.html
        trailingSlash: true,
      }
    : {}),

  env: {
    // Usado pelos <img> e <video> comuns para montar o caminho certo
    NEXT_PUBLIC_BASE_PATH: basePath,
    // Na vitrine não há servidor: o pedido vai direto para o WhatsApp
    NEXT_PUBLIC_DEMO: ehDemo ? "1" : "",
    ...(ehDemo ? { NEXT_PUBLIC_SITE_URL: urlDemo } : {}),
  },
};

export default nextConfig;
