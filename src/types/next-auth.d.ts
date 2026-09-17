import NextAuth from "next-auth";

// Estende tipos do NextAuth para incluir campos customizados
declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      username: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: string;
  }
}
