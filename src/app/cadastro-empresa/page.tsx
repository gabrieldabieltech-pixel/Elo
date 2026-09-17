
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { CadastroEmpresaClient } from "./CadastroEmpresaClient";
import prisma from "@/lib/prisma";

export default async function CadastroEmpresaPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const funcoesRaw = await prisma.funcao.findMany({ orderBy: { nome: "asc" } });
  
  return <CadastroEmpresaClient funcoes={funcoesRaw} />;
}