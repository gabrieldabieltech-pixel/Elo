import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const FUNCOES_INICIAIS = [
  "Montador de andaime",
  "Soldador",
  "Pintor",
  "Eletricista",
  "Servente",
  "Carpinteiro",
  "Armador",
  "Pedreiro",
];

async function main() {
  // 1. Criar funções iniciais
  console.log("Criando funções iniciais...");
  for (const nome of FUNCOES_INICIAIS) {
    await prisma.funcao.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
  }
  console.log(`✅ ${FUNCOES_INICIAIS.length} funções criadas/confirmadas.`);

  // 2. Criar admin seed
  const {
    SEED_ADMIN_NAME,
    SEED_ADMIN_USERNAME,
    SEED_ADMIN_EMAIL,
    SEED_ADMIN_PASSWORD,
  } = process.env;

  if (
    !SEED_ADMIN_NAME ||
    !SEED_ADMIN_USERNAME ||
    !SEED_ADMIN_EMAIL ||
    !SEED_ADMIN_PASSWORD
  ) {
    console.warn(
      "⚠️  Variáveis SEED_ADMIN_* não definidas — pulando criação do admin."
    );
    return;
  }

  const normalizedUsername = SEED_ADMIN_USERNAME.trim().toLowerCase();
  const hashedPassword = await bcrypt.hash(SEED_ADMIN_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { username: normalizedUsername },
    update: {
      nome: SEED_ADMIN_NAME,
      email: SEED_ADMIN_EMAIL,
      senha: hashedPassword,
      role: "ADMIN",
    },
    create: {
      nome: SEED_ADMIN_NAME,
      username: normalizedUsername,
      email: SEED_ADMIN_EMAIL,
      senha: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`✅ Admin "${admin.nome}" criado/atualizado (${admin.email}).`);
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
