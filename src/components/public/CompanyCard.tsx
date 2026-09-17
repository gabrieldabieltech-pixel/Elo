import { Card, CardContent } from "@/components/ui/Card"
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"

type Empresa = {
  id: string
  nome: string
  endereco: string
  cidade: string
  estado: string
  whatsapp: string | null
  email: string | null
  telefone: string | null
  funcoes: { nome: string }[]
}

export function CompanyCard({ empresa }: { empresa: Empresa }) {
  const whatsappLink = empresa.whatsapp 
    ? `https://wa.me/55${empresa.whatsapp.replace(/\D/g, '')}`
    : null;

  return (
    <Card className="h-full flex flex-col hover:border-primary/50 transition-colors shadow-sm">
      <CardContent className="p-5 md:p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold font-[family-name:var(--font-display)] text-text-primary mb-2">
          {empresa.nome}
        </h3>
        
        <div className="flex items-start text-sm text-text-secondary mb-4 gap-2">
          <MapPin size={16} className="mt-0.5 shrink-0" />
          <span>{empresa.endereco}<br/>{empresa.cidade} - {empresa.estado}</span>
        </div>

        <div className="mb-5 flex-1">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Vagas / Funções</p>
          <div className="flex flex-wrap gap-1.5">
            {empresa.funcoes.map(f => (
              <span key={f.nome} className="inline-block bg-surface-muted border border-border px-2 py-1 rounded text-xs font-medium text-text-primary">
                {f.nome}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-4 mt-auto space-y-3">
          {empresa.whatsapp && (
            <a href={whatsappLink!} target="_blank" rel="noreferrer" className="block w-full">
              <Button className="w-full bg-[#25D366] hover:bg-[#20b858] text-white gap-2 min-h-[48px] text-base font-semibold border-transparent">
                <MessageCircle size={20} />
                WhatsApp
              </Button>
            </a>
          )}
          
          <div className="flex flex-col gap-2 pt-1">
            {empresa.telefone && (
              <a href={`tel:${empresa.telefone.replace(/\D/g, '')}`} className="flex items-center gap-2 text-sm text-text-primary hover:text-primary transition-colors min-h-[44px]">
                <Phone size={18} className="text-text-secondary" />
                {empresa.telefone}
              </a>
            )}
            {empresa.email && (
              <a href={`mailto:${empresa.email}`} className="flex items-center gap-2 text-sm text-text-primary hover:text-primary transition-colors truncate min-h-[44px]">
                <Mail size={18} className="text-text-secondary shrink-0" />
                <span className="truncate">{empresa.email}</span>
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
