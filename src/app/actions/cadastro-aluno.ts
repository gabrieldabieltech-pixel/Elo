
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendAdminNotification } from "@/lib/whatsapp";

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
    return true; // Bloqueado, tem empresa ativa/pendente/rejeitada não excluída
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
  const alunoNomeFormatado = dadosAluno.nome.trim();
  const empresaNomeFormatado = dadosEmpresa.nome.trim();

  if (await checkAlunoBloqueado(alunoNomeFormatado)) {
    return { error: "Você já enviou seu cadastro. Fale com o professor para corrigir ou refazer." };
  }

  if (await checkEmpresaBloqueada(empresaNomeFormatado)) {
    return { error: "Essa empresa já foi cadastrada por outro colega. Escolha outra empresa." };
  }

  const username = `aluno.${alunoNomeFormatado.split(" ")[0].toLowerCase()}${Math.floor(Math.random() * 1000)}`;
  const password = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedPassword = await bcrypt.hash(password, 10);

  // If user already exists but companies were deleted, we should just append a new company, or create new user?
  // Let is just create a new user or update existing? Let us just find if it exists.
  let userId;
  const userExistente = await prisma.user.findFirst({
    where: { nome: { equals: alunoNomeFormatado, mode: "insensitive" }, role: "ALUNO" }
  });

  if (userExistente) {
    userId = userExistente.id;
    // reset password for convenience so they can login again
    await prisma.user.update({
      where: { id: userId },
      data: { senha: hashedPassword }
    });
  } else {
    const newUser = await prisma.user.create({
      data: {
        nome: alunoNomeFormatado,
        email: dadosAluno.email || `${username}@elo.com`,
        username,
        senha: hashedPassword,
        role: "ALUNO",
      }
    });
    userId = newUser.id;
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
      criadoPorId: userId
    }
  });

  let adminPhone = "5511999999999";
  const config = await prisma.appConfig.findUnique({ where: { key: "ADMIN_PHONE" } });
  if (config) {
    adminPhone = config.value;
  }
  
  await sendAdminNotification(alunoNomeFormatado, empresaNomeFormatado, dadosEmpresa.whatsapp || dadosEmpresa.telefone || "", adminPhone);

  return { success: true, credentials: { username: userExistente ? userExistente.username : username, password } };
}