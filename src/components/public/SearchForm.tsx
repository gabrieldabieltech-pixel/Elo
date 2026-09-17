"use client"
import { useState } from "react"
import { Select } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { Search, Filter, ChevronDown, ChevronUp } from "lucide-react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { ESTADOS_BRASIL } from "@/lib/validations"
import { FormEvent } from "react"

export function SearchForm({ 
  funcoes, 
  cidades 
}: { 
  funcoes: { id: string, nome: string }[],
  cidades: string[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const defaultFuncaoId = searchParams.get('funcaoId') || ""
  const defaultCidade = searchParams.get('cidade') || ""
  const defaultEstado = searchParams.get('estado') || ""

  // Drawer state for mobile
  const [isOpen, setIsOpen] = useState(false)

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const funcaoId = formData.get('funcaoId') as string
    const cidade = formData.get('cidade') as string
    const estado = formData.get('estado') as string

    const params = new URLSearchParams()
    if (funcaoId) params.set('funcaoId', funcaoId)
    if (cidade) params.set('cidade', cidade)
    if (estado) params.set('estado', estado)

    router.push(`${pathname}?${params.toString()}`)
    setIsOpen(false) // Close drawer on search (mobile)
  }

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm mb-8 overflow-hidden">
      {/* Mobile Toggle Header */}
      <div 
        className="md:hidden flex items-center justify-between p-4 cursor-pointer bg-surface-muted"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 font-medium text-text-primary">
          <Filter size={18} />
          Filtros de Busca
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>

      <form 
        onSubmit={handleSearch} 
        className={`p-4 md:p-6 flex-col md:flex-row gap-4 ${isOpen ? 'flex' : 'hidden md:flex'}`}
      >
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-text-secondary mb-1">Buscar por Função</label>
          <Select name="funcaoId" defaultValue={defaultFuncaoId} className="h-[44px]">
            <option value="">Todas as funções</option>
            {funcoes.map(f => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </Select>
        </div>
        
        <div className="w-full md:w-56">
          <label className="block text-sm font-medium text-text-secondary mb-1">Cidade</label>
          <Select name="cidade" defaultValue={defaultCidade} className="h-[44px]">
            <option value="">Todas as cidades</option>
            {cidades.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>

        <div className="w-full md:w-32">
          <label className="block text-sm font-medium text-text-secondary mb-1">Estado</label>
          <Select name="estado" defaultValue={defaultEstado} className="h-[44px]">
            <option value="">Todos</option>
            {ESTADOS_BRASIL.map(uf => <option key={uf} value={uf}>{uf}</option>)}
          </Select>
        </div>

        <div className="flex items-end mt-2 md:mt-0">
          <Button type="submit" variant="primary" className="w-full md:w-auto h-[44px] gap-2 text-base">
            <Search size={18} />
            Buscar
          </Button>
        </div>
      </form>
    </div>
  )
}
