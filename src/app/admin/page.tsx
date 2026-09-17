import prisma from "@/lib/prisma"
import { AdminEmpresasTable } from "./AdminEmpresasTable"
import { requireAuth } from "@/lib/server-auth"
import { ConfigTelefone } from "./ConfigTelefone"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await requireAuth({ allowRoles: ["ADMIN"] })
  
  const params = await searchParams;
  const tab = (params.tab as string) || "PENDENTE"
  const page = parseInt((params.page as string) || "1", 10)
  const q = (params.q as string) || ""
  const cidade = (params.cidade as string) || ""
  const estado = (params.estado as string) || ""

  const take = 25
  const skip = (page - 1) * take

  // Determine Prisma where clause
  const where: any = {}
  
  if (tab === "EXCLUIDAS") {
    where.deletadoEm = { not: null }
  } else {
    where.deletadoEm = null
    if (tab === "PENDENTE" || tab === "APROVADO" || tab === "REJEITADO") {
      where.status = tab
    }
  }

  if (q) {
    where.nome = { contains: q, mode: "insensitive" }
  }
  if (cidade) {
    where.cidade = { contains: cidade, mode: "insensitive" }
  }
  if (estado) {
    where.estado = estado
  }

  const [empresas, total, pendingCount, adminPhoneConfig] = await Promise.all([
    prisma.empresa.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      skip,
      take,
      include: {
        funcoes: {
          select: { nome: true }
        }
      }
    }),
    prisma.empresa.count({ where }),
    prisma.empresa.count({ where: { status: 'PENDENTE', deletadoEm: null } }),
    prisma.appConfig.findUnique({ where: { key: "ADMIN_PHONE" } })
  ])

  const totalPages = Math.ceil(total / take)
  const telefoneInicial = adminPhoneConfig?.value || "";

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-[family-name:var(--font-display)] font-semibold text-text-primary">
            Gestão de Empresas
          </h1>
          <p className="text-text-secondary mt-1">
            Aprove, edite ou remova cadastros recebidos no portal.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <a
            href="https://wa.me/?text=Olá!%20Acesse%20este%20link%20para%20cadastrar%20sua%20empresa%20e%20criar%20seu%20acesso%20no%20sistema%20Elo:%20https://elovagas.com/cadastro-aluno"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm h-9 px-3 text-sm rounded-md"
          >
            Enviar Link WhatsApp
          </a>
          <ConfigTelefone telefoneInicial={telefoneInicial} />
        </div>
      </div>

      <AdminEmpresasTable 
        empresas={empresas as any} 
        total={total}
        currentPage={page}
        totalPages={totalPages}
        currentTab={tab}
        searchQ={q}
        searchCidade={cidade}
        searchEstado={estado}
        pendingCount={pendingCount}
      />
    </div>
  )
}
