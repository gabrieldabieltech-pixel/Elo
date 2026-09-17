
"use client";
import { useState, useEffect } from "react";
import { submitAutocadastro } from "@/app/actions/cadastro-aluno";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AutocadastroClient() {
  const [step, setStep] = useState(0);
  const [aluno, setAluno] = useState({ nome: "", email: "" });
  const [empresa, setEmpresa] = useState({ nome: "", endereco: "", cidade: "", estado: "", whatsapp: "", telefone: "", email: "" });
  const [credentials, setCredentials] = useState<{username: string, password: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const draft = localStorage.getItem("elo_cadastro_draft");
    if (draft && step === 0) {
      if (window.confirm("Você tem um cadastro em andamento. Deseja continuar de onde parou?")) {
        const parsed = JSON.parse(draft);
        setAluno(parsed.aluno);
        setEmpresa(parsed.empresa);
        setStep(parsed.step);
      } else {
        localStorage.removeItem("elo_cadastro_draft");
        setStep(1);
      }
    } else if (step === 0) {
      setStep(1);
    }
  }, [step]);

  const saveDraft = (s: number, a: any, e: any) => {
    localStorage.setItem("elo_cadastro_draft", JSON.stringify({ step: s, aluno: a, empresa: e }));
  };

  const handleNext = () => {
    if (!aluno.nome.trim()) {
      setError("Preencha seu nome");
      return;
    }
    setError("");
    setStep(2);
    saveDraft(2, aluno, empresa);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa.nome.trim() || !empresa.cidade.trim() || !empresa.estado.trim()) {
      setError("Preencha os campos obrigatórios da empresa");
      return;
    }
    setLoading(true);
    setError("");
    const res = await submitAutocadastro(aluno, empresa);
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else if (res.success && res.credentials) {
      setCredentials(res.credentials);
      localStorage.removeItem("elo_cadastro_draft");
      setStep(3);
      setLoading(false);
    }
  };

  if (step === 0) return <div className="p-10 text-center">Carregando...</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-app-bg min-h-screen">
      <h1 className="text-2xl font-bold text-primary mb-6">Cadastro de Empresa e Aluno</h1>
      
      {step === 1 && (
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
          <h2 className="text-xl mb-4 font-semibold">Passo 1: Seus Dados (Aluno)</h2>
          <div className="space-y-4">
            <div>
              <Label>Nome Completo</Label>
              <Input value={aluno.nome} onChange={e => { setAluno({...aluno, nome: e.target.value}); saveDraft(1, {...aluno, nome: e.target.value}, empresa); }} placeholder="João Silva" />
            </div>
            <div>
              <Label>E-mail (Opcional)</Label>
              <Input type="email" value={aluno.email} onChange={e => { setAluno({...aluno, email: e.target.value}); saveDraft(1, {...aluno, email: e.target.value}, empresa); }} placeholder="joao@exemplo.com" />
            </div>
            {error && <p className="text-danger text-sm">{error}</p>}
            <Button onClick={handleNext} className="w-full">Próximo: Dados da Empresa</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-xl border border-border shadow-sm">
          <h2 className="text-xl mb-4 font-semibold">Passo 2: Dados da Empresa</h2>
          <div className="space-y-4">
            <div>
              <Label>Nome da Empresa *</Label>
              <Input required value={empresa.nome} onChange={e => { setEmpresa({...empresa, nome: e.target.value}); saveDraft(2, aluno, {...empresa, nome: e.target.value}); }} />
            </div>
            <div>
              <Label>Cidade *</Label>
              <Input required value={empresa.cidade} onChange={e => setEmpresa({...empresa, cidade: e.target.value})} />
            </div>
            <div>
              <Label>Estado (UF) *</Label>
              <Input required value={empresa.estado} onChange={e => setEmpresa({...empresa, estado: e.target.value})} />
            </div>
            <div>
              <Label>Endereço</Label>
              <Input value={empresa.endereco} onChange={e => setEmpresa({...empresa, endereco: e.target.value})} />
            </div>
            <div>
              <Label>WhatsApp</Label>
              <Input value={empresa.whatsapp} onChange={e => setEmpresa({...empresa, whatsapp: e.target.value})} />
            </div>
            <div>
              <Label>Telefone Fixo</Label>
              <Input value={empresa.telefone} onChange={e => setEmpresa({...empresa, telefone: e.target.value})} />
            </div>
            <div>
              <Label>E-mail Contato</Label>
              <Input type="email" value={empresa.email} onChange={e => setEmpresa({...empresa, email: e.target.value})} />
            </div>
            {error && <p className="text-danger text-sm bg-danger/10 p-2 rounded">{error}</p>}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/3">Voltar</Button>
              <Button type="submit" disabled={loading} className="w-2/3">{loading ? "Enviando..." : "Enviar Cadastro"}</Button>
            </div>
          </div>
        </form>
      )}

      {step === 3 && credentials && (
        <div className="bg-success/10 p-6 rounded-xl border border-success text-center space-y-4">
          <h2 className="text-2xl text-success font-bold">Cadastro Enviado!</h2>
          <p className="text-text-primary">A empresa foi enviada para aprovação do professor.</p>
          <div className="bg-surface p-4 rounded-lg mt-4 border border-border inline-block text-left">
            <p className="text-sm text-text-secondary mb-2">Seus dados de acesso gerados (Anote!):</p>
            <p><strong>Usuário:</strong> {credentials.username}</p>
            <p><strong>Senha:</strong> {credentials.password}</p>
          </div>
          <p className="text-sm mt-4">Com esses dados você poderá acessar a área pública e ver as vagas aprovadas.</p>
          <Link href="/login">
            <Button className="mt-4 w-full">Fazer Login Agora</Button>
          </Link>
        </div>
      )}
    </div>
  );
}