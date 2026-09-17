-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'COLABORADOR');

-- CreateEnum
CREATE TYPE "StatusCadastro" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'COLABORADOR',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "whatsapp" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "status" "StatusCadastro" NOT NULL DEFAULT 'PENDENTE',
    "criadoPorId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "deletadoEm" TIMESTAMP(3),

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Funcao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Funcao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EmpresaToFuncao" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Funcao_nome_key" ON "Funcao"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "_EmpresaToFuncao_AB_unique" ON "_EmpresaToFuncao"("A", "B");

-- CreateIndex
CREATE INDEX "_EmpresaToFuncao_B_index" ON "_EmpresaToFuncao"("B");

-- AddForeignKey
ALTER TABLE "Empresa" ADD CONSTRAINT "Empresa_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmpresaToFuncao" ADD CONSTRAINT "_EmpresaToFuncao_A_fkey" FOREIGN KEY ("A") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmpresaToFuncao" ADD CONSTRAINT "_EmpresaToFuncao_B_fkey" FOREIGN KEY ("B") REFERENCES "Funcao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
