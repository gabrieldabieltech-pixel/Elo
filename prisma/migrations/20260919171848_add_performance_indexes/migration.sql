-- CreateIndex
CREATE INDEX "Empresa_status_deletadoEm_idx" ON "Empresa"("status", "deletadoEm");

-- CreateIndex
CREATE INDEX "Empresa_cidade_estado_idx" ON "Empresa"("cidade", "estado");

-- CreateIndex
CREATE INDEX "Empresa_criadoPorId_idx" ON "Empresa"("criadoPorId");
