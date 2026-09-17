
import { MetadataRoute } from "next"
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Elo Vagas",
    short_name: "Elo",
    description: "Plataforma de vagas e empresas",
    start_url: "/",
    display: "standalone",
    background_color: "#F4F7F9",
    theme_color: "#185FA5",
    icons: [
      {
        src: "/elo-icone-app.svg",
        sizes: "192x192 512x512",
        type: "image/svg+xml",
        purpose: "maskable"
      }
    ],
  }
}