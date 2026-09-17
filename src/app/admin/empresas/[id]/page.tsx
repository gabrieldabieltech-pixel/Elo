import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { AdminEditForm } from "./AdminEditForm"
import { requireAuth } from "@/lib/server-auth"
import { sortFuncoes } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AdminEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth({ allowRoles: ["ADMIN"] })
  const { id } = await params

  const [empresa, funcoesRaw] = await Promise.all([
    prisma.empresa.findUnique({
      where: { id },
      include: {
        funcoes: true
      }
    }),
    prisma.funcao.findMany()
  ])

  const funcoes = sortFuncoes(funcoesRaw as any)

  if (!empresa) {
    notFound()
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-[family-name:var(--font-display)] font-semibold text-text-primary">
          Editar Empresa
        </h1>
        <p className="text-text-secondary mt-1">
          Atualize os dados e o status de {empresa.nome}.
        </p>
      </div>

      <AdminEditForm empresa={empresa as any} funcoes={funcoes} />
    </div>
  )
}
