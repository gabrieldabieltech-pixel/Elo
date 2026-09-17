"use client"
import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Checkbox } from "@/components/ui/Checkbox"
import { Select } from "@/components/ui/Select"
import { Card, CardContent } from "@/components/ui/Card"
import { editarEmpresa } from "@/app/actions/admin"
import { ESTADOS_BRASIL } from "@/lib/validations"
import { toast, Toaster } from "react-hot-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

type EmpresaCompleta = {
  id: string
  nome: string
  endereco: string
  cidade: string
  estado: string
  whatsapp: string | null
  email: string | null
  telefone: string | null
  status: string
  funcoes: { id: string }[]
}

export function AdminEditForm({ empresa, funcoes }: { empresa: EmpresaCompleta, funcoes: { id: string, nome: string }[] }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const selectedFuncoesSet = new Set(empresa.funcoes.map(f => f.id))

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setErrorMsg(null)
    
    try {
      const result = await editarEmpresa(empresa.id, formData)
      
      if (result.success) {
        toast.success("Empresa atualizada com sucesso!")
        router.push("/admin")
      } else {
        setErrorMsg(result.error || "Erro desconhecido")
        toast.error("Verifique os campos e tente novamente")
      }
    } catch (err) {
      setErrorMsg("Ocorreu um erro ao salvar. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Toaster position="top-center" />
      <Card>
        <CardContent className="p-6 sm:p-8">
          <form action={handleSubmit} className="space-y-6">
            
            {errorMsg && (
              <div className="bg-danger-soft text-danger p-4 rounded-md text-sm mb-6">
                {errorMsg}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Status e Dados da Empresa</h3>
              
              <div className="space-y-2 mb-4">
                <Label htmlFor="status">Status do Cadastro</Label>
                <Select id="status" name="status" defaultValue={empresa.status}>
                  <option value="PENDENTE">Pendente</option>
                  <option value="APROVADO">Aprovado</option>
                  <option value="REJEITADO">Rejeitado</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Empresa / Empregador</Label>
                <Input id="nome" name="nome" required defaultValue={empresa.nome} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço (Obra ou Escritório)</Label>
                <Input id="endereco" name="endereco" required defaultValue={empresa.endereco} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" name="cidade" required defaultValue={empresa.cidade} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select id="estado" name="estado" required defaultValue={empresa.estado}>
                    {ESTADOS_BRASIL.map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2 pt-4">Contatos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input id="whatsapp" name="whatsapp" type="tel" defaultValue={empresa.whatsapp || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone Fixo</Label>
                  <Input id="telefone" name="telefone" type="tel" defaultValue={empresa.telefone || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" name="email" type="email" defaultValue={empresa.email || ""} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2 pt-4">Funções Contratadas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {funcoes.map((f) => (
                  <label key={f.id} className="flex items-center space-x-3 bg-surface-muted p-3 rounded-lg border border-border cursor-pointer hover:bg-surface-elevated transition-colors">
                    <Checkbox 
                      name="funcoesIds" 
                      value={f.id} 
                      defaultChecked={selectedFuncoesSet.has(f.id)} 
                    />
                    <span className="text-sm font-medium leading-none">{f.nome}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t">
              <Link href="/admin" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" variant="primary" className="flex-1" isLoading={isSubmitting}>
                Salvar Alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
