
"use client";
import { useState, useEffect } from "react";
import { submitAutocadastro, verificarUsername } from "@/app/actions/cadastro-aluno";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import Link from "next/link";

export default function AutocadastroClient() {
  const [step, setStep] = useState(0);
  const [aluno, setAluno] = useState({ nome: "", username: "" });
  const [empresa, setEmpresa] = useState({ nome: "", endereco: "", cidade: "", estado: "", whatsapp: "", telefone: "", email: "" });
  const [credentials, setCredentials] = useState<{username: string, password: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  
  useEffect(() => {
    const draft = localStorage.getItem("elo_cadastro_draft");
    if (draft && step === 0) {
      if (window.confirm("Você tem um cadastro em andamento. Deseja continuar de onde parou?")) {
        const parsed = JSON.parse(draft);
        setAluno(parsed.aluno);
        setEmpresa(parsed.empresa);
        setStep(1);
      } else {
        localStorage.removeItem("elo_cadastro_draft");
        setStep(1);
      }
    } else if (step === 0) {
      setStep(1);
    }
  }, [step]);

  const saveDraft = (a: any, e: any) => {
    localStorage.setItem("elo_cadastro_draft", JSON.stringify({ aluno: a, empresa: e }));
  };

  const handleUsernameBlur = async () => {
    if (!aluno.username) return;
    const exists = await verificarUsername(aluno.username.trim().toLowerCase());
    if (exists) setUsernameError("Este nome de usuário já está em uso.");
    else setUsernameError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aluno.nome.trim() || !aluno.username.trim()) {
      setError("Preencha seus dados.");
      return;
    }
    if (usernameError) {
      setError("Corrija o nome de usuário.");
      return;
    }
    if (!empresa.nome.trim() || !empresa.cidade.trim() || !empresa.estado.trim()) {
      setError("Preencha os dados obrigatórios da empresa.");
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
      setStep(2); // final screen
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    if (credentials) {
      navigator.clipboard.writeText(`Usuário: ${credentials.username}\nSenha: ${credentials.password}\nLink: https://elovagas.com/login`);
      alert("Copiado para a área de transferência!");
    }
  };

  if (step === 0) return <div className="p-10 text-center">Carregando...</div>;

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6 bg-app-bg min-h-screen">
      <h1 className="text-2xl font-bold text-primary mb-6">Cadastro de Aluno e Empresa</h1>
      
      {step === 1 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
            <h2 className="text-lg mb-4 font-semibold border-b pb-2">Seus Dados (Aluno)</h2>
            <div className="space-y-4">
              <div>
                <Label>Nome Completo *</Label>
                <Input required value={aluno.nome} onChange={e => { setAluno({...aluno, nome: e.target.value}); saveDraft({...aluno, nome: e.target.value}, empresa); }} placeholder="João Silva" />
              </div>
              <div>
                <Label>Nome de Usuário Desejado *</Label>
                <Input required value={aluno.username} onBlur={handleUsernameBlur} onChange={e => { setAluno({...aluno, username: e.target.value}); saveDraft({...aluno, username: e.target.value}, empresa); }} placeholder="joaosilva" />
                {usernameError && <p className="text-danger text-xs mt-1">{usernameError}</p>}
                <p className="text-xs text-text-secondary mt-1">Este será seu login para acessar o sistema.</p>
              </div>
            </div>
          </div>

          <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
            <h2 className="text-lg mb-4 font-semibold border-b pb-2">Dados da Empresa</h2>
            <div className="space-y-4">
              <div>
                <Label>Nome da Empresa *</Label>
                <Input required value={empresa.nome} onChange={e => { setEmpresa({...empresa, nome: e.target.value}); saveDraft(aluno, {...empresa, nome: e.target.value}); }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cidade *</Label>
                  <Input required value={empresa.cidade} onChange={e => { setEmpresa({...empresa, cidade: e.target.value}); saveDraft(aluno, {...empresa, cidade: e.target.value}); }} />
                </div>
                <div>
                  <Label>Estado (UF) *</Label>
                  <Input required value={empresa.estado} onChange={e => { setEmpresa({...empresa, estado: e.target.value}); saveDraft(aluno, {...empresa, estado: e.target.value}); }} maxLength={2} placeholder="SP" />
                </div>
              </div>
              <div>
                <Label>Endereço</Label>
                <Input value={empresa.endereco} onChange={e => { setEmpresa({...empresa, endereco: e.target.value}); saveDraft(aluno, {...empresa, endereco: e.target.value}); }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>WhatsApp</Label>
                  <Input value={empresa.whatsapp} onChange={e => { setEmpresa({...empresa, whatsapp: e.target.value}); saveDraft(aluno, {...empresa, whatsapp: e.target.value}); }} />
                </div>
                <div>
                  <Label>Telefone Fixo</Label>
                  <Input value={empresa.telefone} onChange={e => { setEmpresa({...empresa, telefone: e.target.value}); saveDraft(aluno, {...empresa, telefone: e.target.value}); }} />
                </div>
              </div>
              <div>
                <Label>E-mail da Empresa</Label>
                <Input type="email" value={empresa.email} onChange={e => { setEmpresa({...empresa, email: e.target.value}); saveDraft(aluno, {...empresa, email: e.target.value}); }} />
              </div>
            </div>
          </div>

          {error && <p className="text-danger text-sm bg-danger/10 p-3 rounded-md font-medium text-center">{error}</p>}
          <Button type="submit" disabled={loading || !!usernameError} className="w-full h-12 text-base">
            {loading ? "Enviando..." : "Concluir Cadastro"}
          </Button>
        </form>
      )}

      {step === 2 && credentials && (
        <div className="bg-success/10 p-6 rounded-xl border border-success text-center space-y-4">
          <h2 className="text-2xl text-success font-bold">Cadastro Concluído!</h2>
          <p className="text-text-primary">Sua conta foi criada e a empresa foi enviada para aprovação.</p>
          <div className="bg-surface p-5 rounded-lg mt-4 border border-border inline-block text-left w-full max-w-sm">
            <p className="text-sm text-text-secondary mb-3 font-medium">Credenciais de Acesso (SALVE AGORA!):</p>
            <div className="space-y-2">
              <p><strong>Usuário:</strong> {credentials.username}</p>
              <p><strong>Senha:</strong> {credentials.password}</p>
              <p><strong>Link:</strong> elovagas.com/login</p>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4" onClick={copyCredentials}>
              📋 Copiar Credenciais
            </Button>
          </div>
          <Link href="/login">
            <Button className="mt-4 w-full h-12">Ir para Login</Button>
          </Link>
        </div>
      )}
    </div>
  );
}