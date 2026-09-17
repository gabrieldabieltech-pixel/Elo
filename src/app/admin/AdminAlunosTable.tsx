
"use client";
import React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DataTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/DataTable";
import { Search, Check, X, Trash2 } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { aprovarAluno, rejeitarAluno, excluirAluno } from "@/app/actions/admin";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function AdminAlunosTable({ alunos, total, pendingCount }: { alunos: any[], total: number, pendingCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "PENDENTE";
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const tabs = [
    { id: "PENDENTE", label: `Empresas Pendentes (${pendingCount})` },
    { id: "APROVADO", label: "Empresas Aprovadas" },
    { id: "REJEITADO", label: "Empresas Rejeitadas" },
    { id: "EXCLUIDAS", label: "Empresas Excluídas" },
    { id: "ALUNOS", label: "Alunos" },
  ];

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    if (name === "tab") params.delete("page");
    return params.toString();
  };

  const handleAction = async (action: string, id: string) => {
    try {
      let result;
      if (action === "aprovar") result = await aprovarAluno(id);
      if (action === "rejeitar") result = await rejeitarAluno(id);
      if (action === "excluir") result = await excluirAluno(id);
      
      if (result?.success) {
        toast.success("Ação concluída");
        setDeleteId(null);
        router.refresh();
      } else {
        toast.error(result?.error || "Erro na ação");
      }
    } catch (e) {
      toast.error("Erro inesperado");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex overflow-x-auto hide-scrollbar border-b border-border mb-6">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => router.push(pathname + "?" + createQueryString("tab", tab.id))}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${currentTab === tab.id ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary hover:border-border"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <DataTable>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Empresas Cadastradas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alunos.map(aluno => (
              <TableRow key={aluno.id}>
                <TableCell className="font-semibold">{aluno.nome}</TableCell>
                <TableCell>{aluno.username}</TableCell>
                <TableCell>{aluno._count.empresas}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-bold tracking-wider ${aluno.status === "APROVADO" ? "bg-success-soft text-success" : aluno.status === "PENDENTE" ? "bg-warning-soft text-warning" : "bg-danger-soft text-danger"}`}>
                    {aluno.status}
                  </span>
                </TableCell>
                <TableCell className="text-text-secondary text-xs">{new Date(aluno.criadoEm).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell className="text-right space-x-1">
                  {aluno.status !== "APROVADO" && (
                    <Button variant="ghost" size="icon" onClick={() => handleAction("aprovar", aluno.id)} title="Aprovar">
                      <Check size={18} className="text-success" />
                    </Button>
                  )}
                  {aluno.status !== "REJEITADO" && (
                    <Button variant="ghost" size="icon" onClick={() => handleAction("rejeitar", aluno.id)} title="Rejeitar">
                      <X size={18} className="text-warning" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(aluno.id)} title="Excluir">
                    <Trash2 size={18} className="text-danger" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {alunos.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-text-secondary">Nenhum aluno encontrado.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </DataTable>
      </div>
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => { if (deleteId) handleAction("excluir", deleteId); }}
        title="Excluir Aluno"
        description="Tem certeza? O aluno não poderá mais acessar o sistema. Suas empresas ficarão órfãs e não serão excluídas."
      />
    </div>
  );
}