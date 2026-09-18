"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { cadastroEmpresaSchema } from "@/lib/validations";

async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return false;
  }
  return true;
}

export async function aprovarEmpresa(id: string) {
  if (!(await verifyAdmin())) return { success: false, error: "Acesso negado" };

  try {
    await prisma.empresa.update({
      where: { id },
      data: { status: "APROVADO" },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erro ao aprovar empresa." };
  }
}

export async function rejeitarEmpresa(id: string) {
  if (!(await verifyAdmin())) return { success: false, error: "Acesso negado" };

  try {
    await prisma.empresa.update({
      where: { id },
      data: { status: "REJEITADO" },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erro ao rejeitar empresa." };
  }
}

export async function excluirEmpresa(id: string) {
  if (!(await verifyAdmin())) return { success: false, error: "Acesso negado" };

  try {
    await prisma.empresa.update({
      where: { id },
      data: { deletadoEm: new Date() },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erro ao excluir empresa." };
  }
}

export async function restaurarEmpresa(id: string) {
  if (!(await verifyAdmin())) return { success: false, error: "Acesso negado" };

  try {
    await prisma.empresa.update({
      where: { id },
      data: { deletadoEm: null },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erro ao restaurar empresa." };
  }
}

export async function aprovarEmpresasBatch(ids: string[]) {
  if (!(await verifyAdmin())) return { success: false, error: "Acesso negado" };
  if (!ids.length) return { success: false, error: "Nenhuma empresa selecionada" };

  try {
    await prisma.empresa.updateMany({
      where: { id: { in: ids } },
      data: { status: "APROVADO" },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erro ao aprovar empresas." };
  }
}

export async function rejeitarEmpresasBatch(ids: string[]) {
  if (!(await verifyAdmin())) return { success: false, error: "Acesso negado" };
  if (!ids.length) return { success: false, error: "Nenhuma empresa selecionada" };

  try {
    await prisma.empresa.updateMany({
      where: { id: { in: ids } },
      data: { status: "REJEITADO" },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erro ao rejeitar empresas." };
  }
}

export async function editarEmpresa(id: string, formData: FormData) {
  if (!(await verifyAdmin())) return { success: false, error: "Acesso negado" };

  try {
    const funcoesIds = formData.getAll("funcoesIds").map(String);
    const status = formData.get("status")?.toString() || "PENDENTE";
    
    const rawData = {
      nome: formData.get("nome")?.toString() || "",
      endereco: formData.get("endereco")?.toString() || "",
      cidade: formData.get("cidade")?.toString() || "",
      estado: formData.get("estado")?.toString() || "",
      whatsapp: formData.get("whatsapp")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      telefone: formData.get("telefone")?.toString() || "",
      funcoesIds,
    };

    const validatedData = cadastroEmpresaSchema.safeParse(rawData);

    if (!validatedData.success) {
      return { success: false, error: validatedData.error.issues[0].message };
    }

    const data = validatedData.data;

    await prisma.empresa.update({
      where: { id },
      data: {
        nome: data.nome,
        endereco: data.endereco,
        cidade: data.cidade,
        estado: data.estado,
        whatsapp: data.whatsapp || null,
        email: data.email || null,
        telefone: data.telefone || null,
        status: status as any,
        funcoes: {
          set: data.funcoesIds.map((fId) => ({ id: fId })),
        },
      },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erro ao editar empresa." };
  }
}

export async function salvarTelefoneAdmin(telefone: string) {
  if (!(await verifyAdmin())) return { success: false, error: "Acesso negado" };
  await prisma.appConfig.upsert({
    where: { key: "ADMIN_PHONE" },
    update: { value: telefone },
    create: { key: "ADMIN_PHONE", value: telefone }
  });
  return { success: true };
}

import bcrypt from "bcryptjs";

export async function resetarSenhaAluno(empresaId: string) {
  if (!(await verifyAdmin())) return { success: false, error: "Acesso negado" };
  try {
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      include: { criadoPor: true }
    });

    if (!empresa || !empresa.criadoPor) {
      return { success: false, error: "Aluno não encontrado." };
    }

    const userId = empresa.criadoPor.id;
    const novaSenha = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(novaSenha, 10);
    
    await prisma.user.update({ 
      where: { id: userId }, 
      data: { senha: hashedPassword, senhaAberta: novaSenha } 
    });
    
    revalidatePath("/admin");
    return { success: true, credentials: { password: novaSenha, username: empresa.criadoPor.username } };
  } catch (e) {
    return { success: false };
  }
}

export async function resetarSenhaAlunoPorId(userId: string) {
  if (!(await verifyAdmin())) return { success: false, error: "Acesso negado" };
  try {
    const novaSenha = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(novaSenha, 10);
    
    await prisma.user.update({ 
      where: { id: userId }, 
      data: { senha: hashedPassword, senhaAberta: novaSenha } 
    });
    
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

export async function aprovarAluno(id: string) {
  if (!(await verifyAdmin())) return { success: false, error: "Acesso negado" };
  try {
    await prisma.user.update({ where: { id }, data: { status: "APROVADO", ativo: true } });
    revalidatePath("/admin");
    return { success: true };
  } catch (e) { return { success: false }; }
}

export async function rejeitarAluno(id: string) {
  if (!(await verifyAdmin())) return { success: false, error: "Acesso negado" };
  try {
    await prisma.user.update({ where: { id }, data: { status: "REJEITADO", ativo: false } });
    revalidatePath("/admin");
    return { success: true };
  } catch (e) { return { success: false }; }
}

export async function excluirAluno(id: string) {
  if (!(await verifyAdmin())) return { success: false, error: "Acesso negado" };
  try {
    await prisma.empresa.updateMany({ where: { criadoPorId: id }, data: { criadoPorId: null } });
    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true };
  } catch (e) { return { success: false }; }
}
