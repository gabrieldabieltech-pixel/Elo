"use client"
import * as React from "react"
import { DataTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/DataTable"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Checkbox } from "@/components/ui/Checkbox"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { aprovarEmpresa, rejeitarEmpresa, excluirEmpresa, restaurarEmpresa, aprovarEmpresasBatch, rejeitarEmpresasBatch } from "@/app/actions/admin"
import { toast, Toaster } from "react-hot-toast"
import { Check, X, Trash2, Edit, RotateCcw, Search } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { ESTADOS_BRASIL } from "@/lib/validations"

type Empresa = {
  id: string
  nome: string
  cidade: string
  estado: string
  status: string
  criadoEm: Date
  deletadoEm: Date | null
  funcoes: { nome: string }[]
}

export function AdminEmpresasTable({ 
  empresas, 
  total, 
  currentPage, 
  totalPages, 
  currentTab,
  searchQ,
  searchCidade,
  searchEstado
}: { 
  empresas: Empresa[], 
  total: number, 
  currentPage: number, 
  totalPages: number, 
  currentTab: string,
  searchQ: string,
  searchCidade: string,
  searchEstado: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [bulkAction, setBulkAction] = React.useState<'aprovar' | 'rejeitar' | null>(null)
  const [isProcessing, setIsProcessing] = React.useState<string | null>(null) // specific ID or 'bulk'

  // Reset selection when changing tabs/pages
  React.useEffect(() => {
    setSelectedIds(new Set())
  }, [empresas])

  const createQueryString = React.useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(name, value)
      else params.delete(name)
      if (name !== 'page') params.set('page', '1') // Reset page on new filters
      return params.toString()
    },
    [searchParams]
  )

  const handleAction = async (action: 'aprovar' | 'rejeitar' | 'excluir' | 'restaurar', id: string) => {
    setIsProcessing(id)
    try {
      let result;
      if (action === 'aprovar') result = await aprovarEmpresa(id);
      else if (action === 'rejeitar') result = await rejeitarEmpresa(id);
      else if (action === 'excluir') result = await excluirEmpresa(id);
      else result = await restaurarEmpresa(id);

      if (result.success) {
        toast.success(`Ação '${action}' concluída com sucesso!`);
        router.refresh();
      } else {
        toast.error(result.error || `Erro ao ${action}`);
      }
    } catch (e) {
      toast.error(`Erro inesperado ao ${action}`);
    } finally {
      setIsProcessing(null)
      if (action === 'excluir') setDeleteId(null);
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    setIsProcessing('bulk')
    try {
      let result;
      const ids = Array.from(selectedIds);
      if (bulkAction === 'aprovar') result = await aprovarEmpresasBatch(ids);
      else result = await rejeitarEmpresasBatch(ids);

      if (result.success) {
        toast.success(`${selectedIds.size} empresas ${bulkAction === 'aprovar' ? 'aprovadas' : 'rejeitadas'}!`);
        setSelectedIds(new Set());
        router.refresh();
      } else {
        toast.error(result.error || `Erro na ação em lote`);
      }
    } catch (e) {
      toast.error(`Erro inesperado`);
    } finally {
      setIsProcessing(null)
      setBulkAction(null)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === empresas.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(empresas.map(e => e.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const getStatusBadge = (emp: Empresa) => {
    if (emp.deletadoEm) return <Badge variant="destructive">Excluído</Badge>
    switch (emp.status) {
      case 'PENDENTE': return <Badge variant="warning">Pendente</Badge>
      case 'APROVADO': return <Badge variant="success">Aprovado</Badge>
      case 'REJEITADO': return <Badge variant="destructive">Rejeitado</Badge>
      default: return <Badge variant="secondary">{emp.status}</Badge>
    }
  }

  const tabs = [
    { id: 'PENDENTE', label: 'Pendentes' },
    { id: 'APROVADO', label: 'Aprovadas' },
    { id: 'REJEITADO', label: 'Rejeitadas' },
    { id: 'EXCLUIDAS', label: 'Excluídas' },
  ]

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const q = formData.get('q') as string
    const cidade = formData.get('cidade') as string
    const estado = formData.get('estado') as string
    
    let url = pathname + '?' + createQueryString('q', q)
    router.push(url)
    // To handle multiple params properly, we can build it manually
    const params = new URLSearchParams(searchParams.toString())
    if (q) params.set('q', q); else params.delete('q')
    if (cidade) params.set('cidade', cidade); else params.delete('cidade')
    if (estado) params.set('estado', estado); else params.delete('estado')
    params.set('page', '1')
    router.push(pathname + '?' + params.toString())
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Excluir Empresa"
        description="Tem certeza que deseja excluir este cadastro? Ele será movido para a aba de Excluídas."
        confirmLabel={isProcessing === deleteId ? "Excluindo..." : "Excluir"}
        onConfirm={() => deleteId && handleAction('excluir', deleteId)}
        variant="danger"
      />

      <ConfirmDialog
        open={!!bulkAction}
        onOpenChange={(open) => !open && setBulkAction(null)}
        title={bulkAction === 'aprovar' ? "Aprovar Selecionadas" : "Rejeitar Selecionadas"}
        description={`Tem certeza que deseja ${bulkAction} ${selectedIds.size} empresas de uma vez?`}
        confirmLabel={isProcessing === 'bulk' ? "Processando..." : "Confirmar"}
        onConfirm={handleBulkAction}
        variant={bulkAction === 'aprovar' ? "primary" : "warning"}
      />

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-border">
        {tabs.map(tab => (
          <Link key={tab.id} href={pathname + '?' + createQueryString('tab', tab.id)}>
            <div className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${currentTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'}`}>
              {tab.label}
            </div>
          </Link>
        ))}
      </div>

      {/* Search & Filters */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-text-secondary" />
          <Input name="q" defaultValue={searchQ} placeholder="Buscar por nome..." className="pl-9" />
        </div>
        <div className="w-full sm:w-48">
          <Input name="cidade" defaultValue={searchCidade} placeholder="Cidade..." />
        </div>
        <div className="w-full sm:w-32">
          <Select name="estado" defaultValue={searchEstado}>
            <option value="">UF (Todos)</option>
            {ESTADOS_BRASIL.map(uf => <option key={uf} value={uf}>{uf}</option>)}
          </Select>
        </div>
        <Button type="submit" variant="secondary">Filtrar</Button>
      </form>

      {/* Bulk Actions Bar */}
      {currentTab === 'PENDENTE' && selectedIds.size > 0 && (
        <div className="bg-primary-soft border border-primary/20 rounded-lg p-3 flex items-center justify-between animate-in fade-in zoom-in-95 duration-200">
          <span className="text-sm font-medium text-primary">
            {selectedIds.size} {selectedIds.size === 1 ? 'empresa selecionada' : 'empresas selecionadas'}
          </span>
          <div className="space-x-2">
            <Button size="sm" variant="outline" className="border-warning text-warning hover:bg-warning-soft" onClick={() => setBulkAction('rejeitar')}>
              Rejeitar Selecionadas
            </Button>
            <Button size="sm" variant="primary" onClick={() => setBulkAction('aprovar')}>
              Aprovar Selecionadas
            </Button>
          </div>
        </div>
      )}

      {/* Tabela */}
      <DataTable>
        <TableHeader>
          <TableRow>
            {currentTab === 'PENDENTE' && (
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={empresas.length > 0 && selectedIds.size === empresas.length}
                  onChange={toggleSelectAll}
                />
              </TableHead>
            )}
            <TableHead>Empresa</TableHead>
            <TableHead>Local</TableHead>
            <TableHead>Funções</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {empresas.map((emp) => (
            <TableRow key={emp.id} className={selectedIds.has(emp.id) ? 'bg-primary-soft/30' : ''}>
              {currentTab === 'PENDENTE' && (
                <TableCell>
                  <Checkbox 
                    checked={selectedIds.has(emp.id)}
                    onChange={() => toggleSelect(emp.id)}
                  />
                </TableCell>
              )}
              <TableCell className="font-semibold">{emp.nome}</TableCell>
              <TableCell>{emp.cidade} - {emp.estado}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {emp.funcoes.slice(0, 2).map((f) => (
                    <span key={f.nome} className="inline-block bg-surface-muted px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider">
                      {f.nome}
                    </span>
                  ))}
                  {emp.funcoes.length > 2 && (
                    <span className="inline-block bg-surface-muted px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider">
                      +{emp.funcoes.length - 2}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-text-secondary text-xs">
                {new Date(emp.criadoEm).toLocaleDateString('pt-BR')}
              </TableCell>
              <TableCell>{getStatusBadge(emp)}</TableCell>
              <TableCell className="text-right space-x-1">
                {!emp.deletadoEm && emp.status !== 'APROVADO' && (
                  <Button 
                    variant="ghost" size="icon" 
                    className="text-success hover:text-success hover:bg-success-soft"
                    onClick={() => handleAction('aprovar', emp.id)}
                    disabled={!!isProcessing} title="Aprovar"
                  >
                    <Check size={18} />
                  </Button>
                )}
                {!emp.deletadoEm && emp.status !== 'REJEITADO' && (
                  <Button 
                    variant="ghost" size="icon" 
                    className="text-warning hover:text-warning hover:bg-warning-soft"
                    onClick={() => handleAction('rejeitar', emp.id)}
                    disabled={!!isProcessing} title="Rejeitar"
                  >
                    <X size={18} />
                  </Button>
                )}
                
                {emp.deletadoEm ? (
                  <Button 
                    variant="ghost" size="icon" 
                    className="text-primary hover:text-primary hover:bg-primary-soft"
                    onClick={() => handleAction('restaurar', emp.id)}
                    disabled={!!isProcessing} title="Restaurar"
                  >
                    <RotateCcw size={18} />
                  </Button>
                ) : (
                  <>
                    <Link href={`/admin/empresas/${emp.id}`}>
                      <Button variant="ghost" size="icon" title="Editar">
                        <Edit size={18} className="text-text-secondary" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" size="icon" 
                      onClick={() => setDeleteId(emp.id)}
                      disabled={!!isProcessing} title="Excluir"
                    >
                      <Trash2 size={18} className="text-danger" />
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
          {empresas.length === 0 && (
            <TableRow>
              <TableCell colSpan={currentTab === 'PENDENTE' ? 7 : 6} className="text-center py-8 text-text-secondary">
                Nenhuma empresa encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </DataTable>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-sm text-text-secondary">
            Mostrando {empresas.length} de {total} registros
          </span>
          <div className="flex gap-2">
            <Link 
              href={pathname + '?' + createQueryString('page', String(Math.max(1, currentPage - 1)))}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border border-border bg-surface hover:bg-surface-muted ${currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}`}
            >
              Anterior
            </Link>
            <Link 
              href={pathname + '?' + createQueryString('page', String(Math.min(totalPages, currentPage + 1)))}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border border-border bg-surface hover:bg-surface-muted ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
            >
              Próxima
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
