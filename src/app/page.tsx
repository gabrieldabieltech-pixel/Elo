import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import Image from "next/image"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { SearchForm } from "@/components/public/SearchForm"
import { CompanyCard } from "@/components/public/CompanyCard"
import { ExportPdfButton } from "@/components/public/ExportPdfButton"
import { InstallPWA } from "@/components/public/InstallPWA"
import { Button } from "@/components/ui/Button"
import { sortFuncoes } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await getServerSession(authOptions)

  // HEADER REUTILIZÁVEL
  const renderHeader = (isLogged: boolean) => (
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
          <InstallPWA />
          {!isLogged ? (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-text-secondary min-h-[44px]">
                  Entrar
                </Button>
              </Link>
              <Link href="/cadastro-aluno">
                <Button variant="outline" size="sm" className="flex min-h-[44px]">
                  Cadastrar
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/cadastro-empresa">
                <Button variant="outline" size="sm" className="flex min-h-[44px]">
                  + Nova Empresa
                </Button>
              </Link>
              {(session as any)?.user?.role === "ADMIN" && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="flex min-h-[44px]">
                    Painel
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )

  // SE NÃO ESTIVER LOGADO -> APENAS A APRESENTAÇÃO
  if (!session) {
    return (
      <main className="min-h-screen bg-app-bg flex flex-col">
        {renderHeader(false)}
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <Image
              src="/elo-icone-app.svg"
              alt="Elo"
              width={64}
              height={64}
              className="w-16 h-16 mx-auto mb-6"
            />
            <h1 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-display)] text-primary">
              Conexão direta com quem trabalha.
            </h1>
            <p className="text-text-secondary text-lg md:text-xl max-w-xl mx-auto">
              Encontre construtoras e empreiteiros contratando na sua região. 
              Sem intermediários.
            </p>
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-48 text-base">
                  Fazer Login
                </Button>
              </Link>
              <Link href="/cadastro-aluno" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-48 text-base">
                  Quero me Cadastrar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Verificar se o aluno está aprovado
  const dbUser = await prisma.user.findUnique({ where: { id: (session as any).user.id } })

  if (dbUser?.role === "ALUNO" && dbUser.status !== "APROVADO") {
    return (
      <main className="min-h-screen bg-app-bg flex flex-col">
        {renderHeader(true)}
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="max-w-xl mx-auto space-y-6 bg-surface p-8 rounded-xl shadow-sm border border-border">
            <h1 className="text-2xl font-bold text-primary">Conta em Análise</h1>
            <p className="text-text-secondary">
              Seu cadastro foi recebido com sucesso, mas a sua conta de aluno ainda está aguardando aprovação da administração.
            </p>
            <p className="text-text-secondary">
              Por favor, aguarde o aviso do administrador para acessar o painel de vagas.
            </p>
            <Link href="/api/auth/signout">
              <Button variant="outline" className="mt-4">Sair</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // SE ESTIVER LOGADO -> LISTAGEM
  const params = await searchParams
  const funcaoId = params.funcaoId as string
  const cidade = params.cidade as string
  const estado = params.estado as string
  const q = params.q as string

  const where: any = {
    status: "APROVADO",
    deletadoEm: null,
  }

  if (funcaoId) {
    where.funcoes = { some: { id: funcaoId } }
  }
  if (cidade) {
    where.cidade = cidade
  }
  if (estado) {
    where.estado = estado
  }
  if (q) {
    where.nome = { contains: q, mode: "insensitive" }
  }

  const cidadesDistintasRaw = await prisma.empresa.findMany({
    where: { status: "APROVADO", deletadoEm: null },
    select: { cidade: true },
    distinct: ["cidade"],
    orderBy: { cidade: "asc" }
  })
  const cidades = cidadesDistintasRaw.map(c => c.cidade)

  const take = 100 // vamos mostrar mais vagas pros logados

  const [funcoesRaw, empresas, totalCount] = await Promise.all([
    prisma.funcao.findMany(),
    prisma.empresa.findMany({
      where,
      orderBy: { atualizadoEm: 'desc' },
      include: {
        funcoes: { select: { nome: true } },
        criadoPor: { select: { nome: true } }
      },
      take
    }),
    prisma.empresa.count({ where })
  ])

  const funcoes = sortFuncoes(funcoesRaw)

  return (
    <main className="min-h-screen bg-app-bg flex flex-col">
      {renderHeader(true)}

      <div className="bg-primary py-8 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] text-white">
            Vagas e Empresas Aprovadas
          </h1>
          <p className="text-primary-foreground/90 text-sm md:text-base">
            Área exclusiva para alunos.
          </p>
        </div>
      </div>

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
