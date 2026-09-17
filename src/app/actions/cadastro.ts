"use server";

import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { cadastroEmpresaSchema } from "@/lib/validations";
import { headers } from "next/headers";

export async function cadastrarEmpresaPublica(formData: FormData) {
  try {
    // 1. Rate limiting - Usando IP como key
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : "unknown-ip";
    
    // Limite de 3 cadastros por IP a cada 1 hora (3600000ms)
    // OBS para Fase 2: Isso usa um Map em memória. Em Vercel/Serverless, precisaremos de KV/Redis
    // O usuário foi avisado disso no walkthrough da Fase 1
    const isAllowed = checkRateLimit(`cadastro_pub_${ip}`, 3, 3600000);
    
    if (!isAllowed) {
      return { 
        success: false, 
        error: "Muitas tentativas. Por favor, tente novamente mais tarde." 
      };
    }

    // 2. Extrair dados
    const funcoesIds = formData.getAll("funcoesIds").map(String);
    
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

    // 3. Validar
    const validatedData = cadastroEmpresaSchema.safeParse(rawData);

    if (!validatedData.success) {
      // Retornar o primeiro erro encontrado
      const firstError = validatedData.error.issues[0].message;
      return { success: false, error: firstError };
    }

    const data = validatedData.data;

    // 4. Salvar no banco com status PENDENTE
    await prisma.empresa.create({
      data: {
        nome: data.nome,
        endereco: data.endereco,
        cidade: data.cidade,
        estado: data.estado,
        // Limpar strings vazias para null
        whatsapp: data.whatsapp || null,
        email: data.email || null,
        telefone: data.telefone || null,
        status: "PENDENTE",
        funcoes: {
          connect: data.funcoesIds.map((id) => ({ id })),
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao cadastrar empresa:", error);
    return { success: false, error: "Erro interno ao salvar os dados. Tente novamente." };
  }
}
