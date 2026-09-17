"use client"
import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Download } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { fetchEmpresasParaPdf } from "@/app/actions/public"
import { toast } from "react-hot-toast"

export function ExportPdfButton({ 
  totalCount, 
  filtros 
}: { 
  totalCount: number,
  filtros: { funcaoId?: string; cidade?: string; estado?: string }
}) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      const empresas = await fetchEmpresasParaPdf(filtros)
      
      const doc = new jsPDF()

      // Header Elo (we will use text styling for simplicity and reliability, matching brand colors)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(22)
      doc.setTextColor(24, 95, 165) // --azul-primario: #185FA5
      doc.text("Elo", 14, 20)
      
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.setTextColor(32, 33, 31) // --tinta: #20211F
      doc.text("Empresas Contratando", 28, 20)
      
      doc.setFontSize(10)
      doc.setTextColor(95, 107, 102) // --cinza-apoio
      doc.text(`Lista gerada em ${new Date().toLocaleDateString('pt-BR')}`, 14, 28)

      const tableData = empresas.map(emp => {
        const contatos = [
          emp.whatsapp ? `WhatsApp: ${emp.whatsapp}` : null,
          emp.telefone ? `Tel: ${emp.telefone}` : null,
          emp.email ? `Email: ${emp.email}` : null
        ].filter(Boolean).join('\n')

        const funcoesStr = emp.funcoes.map((f: any) => f.nome).join(', ')

        return [
          emp.nome,
          `${emp.cidade} - ${emp.estado}`,
          funcoesStr,
          contatos
        ]
      })

      autoTable(doc, {
        startY: 35,
        head: [['Empresa', 'Localização', 'Vagas / Funções', 'Contatos']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [24, 95, 165], // #185FA5
          textColor: [255, 255, 255], 
          fontStyle: 'bold' 
        },
        styles: { fontSize: 9, cellPadding: 4, textColor: [32, 33, 31] },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { cellWidth: 40 },
          2: { cellWidth: 50 },
          3: { cellWidth: 'auto' }
        },
        didDrawPage: function (data) {
          // Footer
          const str = "Página " + doc.internal.pages.length.toString()
          const footerStr = "Elo — conexão direta com quem trabalha."
          doc.setFontSize(8)
          doc.setTextColor(95, 107, 102)
          
          const pageSize = doc.internal.pageSize
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight()
          
          doc.text(footerStr, data.settings.margin.left, pageHeight - 10)
          doc.text(str, pageSize.width - data.settings.margin.right - 15, pageHeight - 10)
        }
      })

      // Filename format: elo-contatos-[funcao]-[data].pdf
      let fileNameStr = "elo-contatos"
      if (filtros.funcaoId && empresas.length > 0) {
        // Find the function name from the first result if available
        const funcName = empresas[0].funcoes.find((f:any) => f.nome)?.nome || "vagas"
        fileNameStr += `-${funcName.toLowerCase().replace(/\s+/g, '-')}`
      }
      const dataStr = new Date().toISOString().split('T')[0]
      doc.save(`${fileNameStr}-${dataStr}.pdf`)

    } catch (e) {
      toast.error("Erro ao gerar PDF.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      onClick={generatePDF}
      disabled={totalCount === 0 || isGenerating}
      className="gap-2 min-h-[44px] w-full sm:w-auto"
    >
      <Download size={18} />
      {isGenerating ? "Gerando PDF..." : `Baixar lista (${totalCount} ${totalCount === 1 ? 'empresa' : 'empresas'})`}
    </Button>
  )
}
