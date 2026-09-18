export async function sendAdminNotification(studentName: string, companyName: string, contactPhone: string, adminPhone: string) {
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!n8nWebhookUrl) {
    console.warn("⚠️ N8N_WEBHOOK_URL não configurada. Simulando envio de WhatsApp...");
    console.log(`[WhatsApp Mock] Para: ${adminPhone} | Nova Empresa: ${companyName} | Aluno: ${studentName}`);
    return;
  }

  const message = `🚨 *Novo Cadastro Pendente*\n\n*Aluno:* ${studentName}\n*Empresa:* ${companyName}\n*Contato:* ${contactPhone}\n\nAcesse o painel para aprovar o aluno e a empresa: https://elovagas.com/admin`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: adminPhone,
        message,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error("❌ Falha ao enviar WhatsApp via n8n:", res.statusText);
    }
  } catch (error) {
    console.error("❌ Erro de rede ou timeout ao disparar WhatsApp via n8n:", error);
  }
}