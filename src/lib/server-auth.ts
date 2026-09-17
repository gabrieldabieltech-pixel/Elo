import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export interface AuthContext {
  user: {
    id: string;
    nome: string;
    username: string;
    role: string;
  };
}

export async function requireAuth(options?: {
  allowRoles?: string[];
  returnResponse?: boolean;
}): Promise<AuthContext | Response> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    if (options?.returnResponse) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
      });
    }
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!dbUser || !dbUser.ativo) {
    if (options?.returnResponse) {
      return new Response(JSON.stringify({ error: "Acesso negado" }), {
        status: 403,
      });
    }
    redirect("/login");
  }

  if (options?.allowRoles && !options.allowRoles.includes(dbUser.role)) {
    if (options?.returnResponse) {
      return new Response(JSON.stringify({ error: "Acesso negado" }), {
        status: 403,
      });
    }
    redirect("/");
  }

  return {
    user: {
      id: dbUser.id,
      nome: dbUser.nome,
      username: dbUser.username,
      role: dbUser.role,
    },
  };
}
