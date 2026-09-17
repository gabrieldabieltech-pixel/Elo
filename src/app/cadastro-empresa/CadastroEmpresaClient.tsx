
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useRouter } from "next/navigation";
import { submitNovaEmpresaLogado } from "@/app/actions/cadastro-empresa";

export function CadastroEmpresaClient({ funcoes }: { funcoes: any[] }) {
  const [empresa, setEmpresa] = useState({ nome: "", endereco: "", cidade: "", estado: "", whatsapp: "", telefone: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa.nome.trim() || !empresa.cidade.trim() || !empresa.estado.trim()) {
      setError("Preencha os dados obrigatórios da empresa.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await submitNovaEmpresaLogado(empresa);
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      alert("Empresa cadastrada com sucesso! Ela foi enviada para aprovação.");
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-app-bg min-h-screen">
      <h1 className="text-2xl font-bold text-primary mb-6">Cadastrar Nova Empresa</h1>
      <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-xl border border-border shadow-sm space-y-4">
        <div>
          <Label>Nome da Empresa *</Label>
          <Input required value={empresa.nome} onChange={e => setEmpresa({...empresa, nome: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Cidade *</Label>
            <Input required value={empresa.cidade} onChange={e => setEmpresa({...empresa, cidade: e.target.value})} />
          </div>
          <div>
            <Label>Estado (UF) *</Label>
            <Input required value={empresa.estado} onChange={e => setEmpresa({...empresa, estado: e.target.value})} maxLength={2} placeholder="SP" />
          </div>
        </div>
        <div>
          <Label>Endereço</Label>
          <Input value={empresa.endereco} onChange={e => setEmpresa({...empresa, endereco: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>WhatsApp</Label>
            <Input value={empresa.whatsapp} onChange={e => setEmpresa({...empresa, whatsapp: e.target.value})} />
          </div>
          <div>
            <Label>Telefone Fixo</Label>
            <Input value={empresa.telefone} onChange={e => setEmpresa({...empresa, telefone: e.target.value})} />
          </div>
        </div>
        <div>
          <Label>E-mail da Empresa</Label>
          <Input type="email" value={empresa.email} onChange={e => setEmpresa({...empresa, email: e.target.value})} />
        </div>
        
        {error && <p className="text-danger text-sm bg-danger/10 p-2 rounded">{error}</p>}
        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()} className="w-1/3">Cancelar</Button>
          <Button type="submit" disabled={loading} className="w-2/3">{loading ? "Salvando..." : "Salvar Empresa"}</Button>
        </div>
      </form>
    </div>
  );
}