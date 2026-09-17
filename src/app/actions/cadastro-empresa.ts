
"use server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkEmpresaBloqueada } from "./cadastro-aluno";
import { sendAdminNotification } from "@/lib/whatsapp";
import { revalidatePath } from "next/cache";

export async function submitNovaEmpresaLogado(dadosEmpresa: any) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return { error: "Você precisa estar logado para cadastrar uma empresa." };
  }

  const empresaNomeFormatado = dadosEmpresa.nome.trim();

  if (await checkEmpresaBloqueada(empresaNomeFormatado)) {
    return { error: "Essa empresa já foi cadastrada por outro colega. Escolha outra empresa." };
  }

  await prisma.empresa.create({
    data: {
      nome: empresaNomeFormatado,
      endereco: dadosEmpresa.endereco,
      cidade: dadosEmpresa.cidade,
      estado: dadosEmpresa.estado,
      whatsapp: dadosEmpresa.whatsapp,
      telefone: dadosEmpresa.telefone,
      email: dadosEmpresa.email,
      status: "PENDENTE",
      criadoPorId: session.user.id
    }
  });

  let adminPhone = "5511999999999";
  const config = await prisma.appConfig.findUnique({ where: { key: "ADMIN_PHONE" } });
  if (config) adminPhone = config.value;
  
  await sendAdminNotification(session.user.name || "Aluno Logado", empresaNomeFormatado, dadosEmpresa.whatsapp || dadosEmpresa.telefone || "", adminPhone);

  revalidatePath("/");
  return { success: true };
}