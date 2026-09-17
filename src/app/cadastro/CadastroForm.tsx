"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/Checkbox";
import { Select } from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";
import { cadastrarEmpresaPublica } from "@/app/actions/cadastro";
import { ESTADOS_BRASIL } from "@/lib/validations";
import { toast, Toaster } from "react-hot-toast";
import { CheckCircle2 } from "lucide-react";

interface CadastroFormProps {
  funcoes: { id: string; nome: string }[];
}

export function CadastroForm({ funcoes }: CadastroFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setErrorMsg(null);
    
    try {
      const result = await cadastrarEmpresaPublica(formData);
      
      if (result.success) {
        setIsSuccess(true);
        toast.success("Cadastro enviado com sucesso!");
      } else {
        setErrorMsg(result.error || "Erro desconhecido");
        toast.error("Verifique os campos e tente novamente");
      }
    } catch (err) {
      setErrorMsg("Ocorreu um erro ao enviar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <Card className="p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-success-soft p-4 rounded-full">
            <CheckCircle2 className="w-12 h-12 text-success" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-[family-name:var(--font-display)] font-semibold text-text-primary mb-2">
            Cadastro Recebido!
          </h2>
          <p className="text-text-secondary">
            Sua empresa foi cadastrada e está em fase de análise. 
            Em breve ela aparecerá nas buscas para os trabalhadores.
          </p>
        </div>
        <div className="pt-4">
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            Voltar para a página inicial
          </Button>
        </div>
      </Card>
    );
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
              <h3 className="font-semibold text-lg border-b pb-2">Dados da Empresa</h3>
              
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Empresa / Empregador *</Label>
                <Input id="nome" name="nome" required placeholder="Ex: Construtora Silva" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço (Obra ou Escritório) *</Label>
                <Input id="endereco" name="endereco" required placeholder="Rua, Número, Bairro" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input id="cidade" name="cidade" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado *</Label>
                  <Select id="estado" name="estado" required defaultValue="">
                    <option value="" disabled>Selecione...</option>
                    {ESTADOS_BRASIL.map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2 pt-4">Contatos</h3>
              <p className="text-sm text-text-secondary mb-4">
                Preencha <strong>pelo menos um</strong> meio de contato. Este será o canal que o trabalhador usará para enviar currículos.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input id="whatsapp" name="whatsapp" placeholder="(00) 00000-0000" type="tel" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone Fixo</Label>
                  <Input id="telefone" name="telefone" placeholder="(00) 0000-0000" type="tel" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" name="email" placeholder="vagas@empresa.com" type="email" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2 pt-4">Funções que sua empresa contrata *</h3>
              <p className="text-sm text-text-secondary mb-4">
                Marque todas as funções que sua empresa costuma contratar, mesmo que não tenha vaga aberta neste momento.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {funcoes.map((f) => (
                  <label key={f.id} className="flex items-center space-x-3 bg-surface-muted p-3 rounded-lg border border-border cursor-pointer hover:bg-surface-elevated transition-colors">
                    <Checkbox name="funcoesIds" value={f.id} />
                    <span className="text-sm font-medium leading-none">{f.nome}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t">
              <Button type="submit" variant="primary" className="w-full min-h-[48px] text-base" isLoading={isSubmitting}>
                Cadastrar Empresa
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
