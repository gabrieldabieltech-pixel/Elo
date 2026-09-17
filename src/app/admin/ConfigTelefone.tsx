
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { salvarTelefoneAdmin } from "@/app/actions/admin";

export function ConfigTelefone({ telefoneInicial }: { telefoneInicial: string }) {
  const [tel, setTel] = useState(telefoneInicial);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await salvarTelefoneAdmin(tel);
    setLoading(false);
    setOpen(false);
  };

  if (!open) {
    return <Button variant="outline" size="sm" onClick={() => setOpen(true)}>🔔 Ativar Notificações Zap (Aprovações)</Button>;
  }

  return (
    <div className="flex items-center gap-2">
      <Input value={tel} onChange={e => setTel(e.target.value)} placeholder="5511999999999" className="h-9" />
      <Button size="sm" onClick={handleSave} disabled={loading}>{loading ? "Salvando..." : "Salvar"}</Button>
      <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
    </div>
  );
}