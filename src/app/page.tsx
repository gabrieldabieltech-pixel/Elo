import Image from "next/image"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { SearchForm } from "@/components/public/SearchForm"
import { CompanyCard } from "@/components/public/CompanyCard"
import { ExportPdfButton } from "@/components/public/ExportPdfButton"
import { Button } from "@/components/ui/Button"
import { sortFuncoes } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const funcaoId = params.funcaoId as string
  const cidade = params.cidade as string
  const estado = params.estado as string

  // Build the where clause for approved companies
  const where: any = {
    status: "APROVADO",
    deletadoEm: null,
  }

  if (funcaoId) {
    where.funcoes = {
      some: { id: funcaoId }
    }
  }
  if (cidade) {
    where.cidade = cidade // Agora é match exato baseado no Select
  }
  if (estado) {
    where.estado = estado
  }

  // Obter lista de cidades distintas para popular o select
  const cidadesDistintasRaw = await prisma.empresa.findMany({
    where: { status: "APROVADO", deletadoEm: null },
    select: { cidade: true },
    distinct: ["cidade"],
    orderBy: { cidade: "asc" }
  });
  const cidades = cidadesDistintasRaw.map(c => c.cidade);

  // Obter funções, empresas renderizadas (com paginação/limite) e o count TOTAL para o botão PDF
  const take = 20; // limite de paginação (não vamos implementar Next/Prev agora para simplificar, mas limitaremos a view pública)
  
  const [funcoesRaw, empresas, totalCount] = await Promise.all([
    prisma.funcao.findMany(),
    prisma.empresa.findMany({
      where,
      orderBy: { atualizadoEm: 'desc' },
      include: {
        funcoes: {
          select: { nome: true }
        },
        criadoPor: {
          select: { nome: true }
        }
      },
      take
    }),
    prisma.empresa.count({ where })
  ])

  const funcoes = sortFuncoes(funcoesRaw);

  return (
    <main className="min-h-screen bg-app-bg flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-border py-4 px-6 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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
          <div className="flex gap-2 sm:gap-4">
            <Link href="/cadastro">
              <Button variant="outline" size="sm" className="flex min-h-[44px]">
                Cadastrar
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="text-text-secondary min-h-[44px] hidden sm:flex">
                Entrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-primary py-10 md:py-12 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold font-[family-name:var(--font-display)] text-white">
            Conexão direta com quem trabalha.
          </h1>
          <p className="text-primary-foreground/90 text-base md:text-xl max-w-2xl mx-auto">
            Encontre construtoras e empreiteiros contratando na sua região. 
            Sem intermediários.
          </p>
          <div className="pt-4 sm:hidden">
            <Link href="/cadastro">
              <Button variant="terracota" size="lg" className="w-full min-h-[48px] text-base font-semibold shadow-md">
                Cadastrar Empresa
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 -mt-6 md:-mt-8">
        <SearchForm funcoes={funcoes} cidades={cidades} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-lg md:text-xl font-semibold text-text-primary">
            {totalCount > 0 
              ? `${totalCount} ${totalCount === 1 ? 'empresa encontrada' : 'empresas encontradas'}`
              : 'Nenhuma empresa encontrada'}
          </h2>
          
          <ExportPdfButton 
            totalCount={totalCount} 
            filtros={{ funcaoId, cidade, estado }} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-12">
          {empresas.map(emp => (
            <CompanyCard key={emp.id} empresa={emp as any} />
          ))}
        </div>

        {totalCount > take && (
          <div className="text-center pb-12">
            <p className="text-text-secondary text-sm mb-4">
              Mostrando as 20 adições mais recentes. Baixe o PDF para ver a lista completa ({totalCount} empresas).
            </p>
          </div>
        )}

        {totalCount === 0 && (
          <div className="text-center py-16 bg-surface rounded-xl border border-border">
            <p className="text-text-secondary text-base">
              Tente mudar os filtros de busca para encontrar mais vagas.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
