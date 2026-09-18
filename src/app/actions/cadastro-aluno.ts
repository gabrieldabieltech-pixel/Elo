
"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendAdminNotification } from "@/lib/whatsapp";

export async function verificarUsername(username: string) {
  const user = await prisma.user.findUnique({
    where: { username }
  });
  return !!user;
}

export async function checkAlunoBloqueado(nome: string) {
  const user = await prisma.user.findFirst({
    where: { 
      nome: { equals: nome, mode: "insensitive" },
      role: "ALUNO"
    },
    include: {
      empresas: {
        where: { deletadoEm: null }
      }
    }
  });
  
  if (user && user.empresas.length > 0) {
    return true; // Bloqueado
  }
  return false;
}

export async function checkEmpresaBloqueada(nome: string) {
  const empresa = await prisma.empresa.findFirst({
    where: { 
      nome: { equals: nome, mode: "insensitive" },
      deletadoEm: null
    }
  });
  return !!empresa;
}

export async function submitAutocadastro(dadosAluno: any, dadosEmpresa: any) {
  try {
    const alunoNomeFormatado = dadosAluno.nome.trim();
    const usernameDesejado = dadosAluno.username.trim().toLowerCase();
    const empresaNomeFormatado = dadosEmpresa.nome.trim();

    if (await verificarUsername(usernameDesejado)) {
      return { error: "Nome de usuário já está em uso." };
    }

    if (await checkEmpresaBloqueada(empresaNomeFormatado)) {
      return { error: "Essa empresa já foi cadastrada por outro colega. Escolha outra empresa." };
    }

    const password = dadosAluno.senha || Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        nome: alunoNomeFormatado,
        email: `${usernameDesejado}@elo.com`,
        username: usernameDesejado,
        senha: hashedPassword,
        senhaAberta: password,
        role: "ALUNO",
        empresas: {
          create: {
            nome: empresaNomeFormatado,
            endereco: dadosEmpresa.endereco || "",
            cidade: dadosEmpresa.cidade,
            estado: dadosEmpresa.estado,
            whatsapp: dadosEmpresa.whatsapp || "",
            telefone: dadosEmpresa.telefone || "",
            email: dadosEmpresa.email || "",
            contatoNome: dadosEmpresa.contatoNome || null,
            contatoCargo: dadosEmpresa.contatoCargo || null,
            contatoEmail: dadosEmpresa.contatoEmail || null,
            status: "PENDENTE",
          }
        }
      },
      include: { empresas: true }
    });

    let adminPhone = "5511999999999";
    const config = await prisma.appConfig.findUnique({ where: { key: "ADMIN_PHONE" } });
    if (config) {
      adminPhone = config.value;
    }
    
    await sendAdminNotification(alunoNomeFormatado, empresaNomeFormatado, dadosEmpresa.whatsapp || dadosEmpresa.telefone || "", adminPhone);

    return { success: true, credentials: { username: usernameDesejado, password } };
  } catch (error: any) {
    console.error("Erro no submitAutocadastro:", error);
    return { error: `Falha interna no servidor: ${error.message}` };
  }
}