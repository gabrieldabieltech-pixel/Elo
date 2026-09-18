
"use client";
import React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DataTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/DataTable";
import { Search, Check, X, Trash2 } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { aprovarAluno, rejeitarAluno, excluirAluno, resetarSenhaAlunoPorId } from "@/app/actions/admin";
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
      if (action === "resetar") {
        if (!window.confirm("Gerar nova senha aleatória para este aluno?")) return;
        result = await resetarSenhaAlunoPorId(id);
      }
      
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
              <TableHead>Senha</TableHead>
              <TableHead>Empresas</TableHead>
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
                <TableCell className="font-mono text-xs">{aluno.senhaAberta || "oculta"}</TableCell>
                <TableCell>{aluno._count?.empresas || 0}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-bold tracking-wider ${aluno.status === "APROVADO" ? "bg-success-soft text-success" : aluno.status === "PENDENTE" ? "bg-warning-soft text-warning" : "bg-danger-soft text-danger"}`}>
                    {aluno.status}
                  </span>
                </TableCell>
                <TableCell className="text-text-secondary text-xs">{new Date(aluno.criadoEm).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => handleAction("resetar", aluno.id)} title="Resetar Senha">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                  </Button>
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