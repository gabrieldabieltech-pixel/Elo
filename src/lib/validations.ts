import { z } from "zod";

export const ESTADOS_BRASIL = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
] as const;

export const cadastroEmpresaSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  endereco: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  cidade: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres"),
  estado: z.enum(ESTADOS_BRASIL, {
    message: "Estado inválido"
  }),
  whatsapp: z.string().optional().nullable(),
  email: z.string().email("E-mail inválido").optional().nullable().or(z.literal("")),
  telefone: z.string().optional().nullable(),
  funcoesIds: z.array(z.string()).min(1, "Selecione pelo menos uma função"),
}).refine(
  (data) => {
    // Check if at least one contact method is provided and not just empty spaces
    const hasWhatsapp = data.whatsapp && data.whatsapp.trim().length > 0;
    const hasEmail = data.email && data.email.trim().length > 0;
    const hasTelefone = data.telefone && data.telefone.trim().length > 0;
    
    return hasWhatsapp || hasEmail || hasTelefone;
  },
  {
    message: "Preencha pelo menos um meio de contato (WhatsApp, E-mail ou Telefone)",
    path: ["contatos_error"], // Custom path to display general error
  }
);

export type CadastroEmpresaForm = z.infer<typeof cadastroEmpresaSchema>;
