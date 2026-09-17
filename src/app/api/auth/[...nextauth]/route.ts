import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod/v4";
import { normalizeUsername } from "@/lib/auth-utils";

const credentialsSchema = z.object({
  username: z.string().min(1, "Obrigatório"),
  password: z.string().min(1, "Obrigatório"),
});

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Usuário", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        try {
          const parsed = credentialsSchema.safeParse(credentials);
          if (!parsed.success) return null;

          const { username, password } = parsed.data;
          const normalizedUser = normalizeUsername(username);

          const user = await prisma.user.findFirst({
            where: { username: normalizedUser },
          });

          if (!user || !user.senha || !user.ativo) {
            throw new Error("Usuário ou senha incorretos");
          }

          if (user.status === "PENDENTE") {
            throw new Error("Seu cadastro ainda está em análise.");
          }

          if (user.status === "REJEITADO") {
            throw new Error("Seu cadastro foi rejeitado.");
          }

          const isValid = await bcrypt.compare(password, user.senha);
          if (!isValid) {
            throw new Error("Usuário ou senha incorretos");
          }

          return {
            id: user.id,
            name: user.nome,
            username: user.username,
            role: user.role,
          };
        } catch (error: any) {
          if (
            error.message === "Usuário ou senha incorretos" ||
            error.message === "Seu cadastro ainda está em análise." ||
            error.message === "Seu cadastro foi rejeitado."
          ) {
            throw error;
          }
          throw new Error("Falha temporária no servidor, tente novamente");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name as string;
        token.username = (user as { username: string }).username;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
