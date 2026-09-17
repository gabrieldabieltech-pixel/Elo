import { CadastroForm } from "./CadastroForm";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { sortFuncoes } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function CadastroPage() {
  // Buscar todas as funções disponíveis
  const funcoesRaw = await prisma.funcao.findMany();
  const funcoes = sortFuncoes(funcoesRaw);

  return (
    <main className="flex min-h-screen flex-col bg-app-bg">
      <header className="bg-surface border-b border-border py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="md:hidden flex items-center gap-2">
              <Image
                src="/elo-icone-app.svg"
                alt="Elo"
                width={32}
                height={32}
                className="w-8 h-8"
                priority
              />
              <span className="font-bold text-xl font-[family-name:var(--font-display)] text-primary">Elo</span>
            </div>
            <div className="hidden md:block">
              <Image
                src="/elo-logo-horizontal.png"
                alt="Elo"
                width={120}
                height={36}
                style={{ width: "auto", height: "auto" }}
                priority
              />
            </div>
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-text-secondary gap-2">
                &larr; Voltar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-[family-name:var(--font-display)] font-semibold text-text-primary mb-2">
              Cadastre sua Empresa
            </h1>
            <p className="text-text-secondary">
              Seja encontrado por trabalhadores da construção civil. 
              Seu cadastro passará por análise antes de ser publicado.
            </p>
          </div>

          <CadastroForm funcoes={funcoes} />
        </div>
      </div>
    </main>
  );
}
