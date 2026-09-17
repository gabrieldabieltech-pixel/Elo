"use server";

import prisma from "@/lib/prisma";

export async function fetchEmpresasParaPdf(filtros: {
  funcaoId?: string;
  cidade?: string;
  estado?: string;
}) {
  const where: any = {
    status: "APROVADO",
    deletadoEm: null,
  };

  if (filtros.funcaoId) {
    where.funcoes = {
      some: { id: filtros.funcaoId },
    };
  }
  if (filtros.cidade) {
    where.cidade = filtros.cidade;
  }
  if (filtros.estado) {
    where.estado = filtros.estado;
  }

  // Busca todas as empresas, sem paginação
  const empresas = await prisma.empresa.findMany({
    where,
    orderBy: { atualizadoEm: "desc" },
    include: {
      funcoes: {
        select: { nome: true },
      },
    },
  });

  return empresas;
}
