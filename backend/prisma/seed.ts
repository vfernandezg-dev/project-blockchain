import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Limpieza
  await prisma.certificate.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.case.deleteMany();
  await prisma.user.deleteMany();

  // Cada cuenta de MetaMask del usuario = un rol (wallets reales, minusculas).
  // Account 2 = ADMIN (owner que desplego), Account 1 = VET.
  const admin = await prisma.user.create({
    data: {
      wallet: "0x41270b3ea88088571250e75f7c098f441bacd2c4",
      name: "VitalPaws (Admin)",
      role: "ADMIN",
    },
  });
  const vet = await prisma.user.create({
    data: {
      wallet: "0xea3e8943ac023cdc8054a1d56ad9d4611274508c",
      name: "Dra. Ana - Centro Vet. Trujillo",
      role: "VET",
    },
  });
  const pedro = await prisma.user.create({
    data: { wallet: "pedro.eth", name: "Pedro", role: "DONANTE" },
  });
  const maria = await prisma.user.create({
    data: { wallet: "maria.eth", name: "Maria", role: "DONANTE" },
  });

  // Caso publicado y financiable (el ejemplo canonico de Firulais)
  const firulais = await prisma.case.create({
    data: {
      title: "Protesis de cadera para Firulais",
      dogName: "Firulais",
      shelter: "Refugio Esperanza Canina",
      description:
        "Firulais perdio movilidad en su pata trasera. Necesita una protesis de cadera impresa en 3D.",
      imageUrl: "https://placedog.net/640/420?id=12",
      material: "TPU Grado Medico",
      goalEth: 0.002, // meta baja para pruebas baratas en Sepolia testnet
      diagnosis: "Displasia de cadera severa. Requiere protesis personalizada.",
      status: "PUBLICADO",
      vetId: vet.id,
    },
  });
  void maria; // (donante de ejemplo, sin donacion previa para empezar limpio en on-chain)

  // Caso recien creado (aun sin publicar)
  await prisma.case.create({
    data: {
      title: "Protesis frontal para Luna",
      dogName: "Luna",
      shelter: "Fundacion Segunda Oportunidad",
      description: "Luna nacio con malformacion en su pata delantera.",
      imageUrl: "https://placedog.net/640/420?id=25",
      material: "PETG",
      goalEth: 0.08,
      diagnosis: "Malformacion congenita miembro anterior.",
      status: "CREADO",
      vetId: vet.id,
    },
  });

  console.log("Seed OK:");
  console.log({ admin: admin.id, vet: vet.id, pedro: pedro.id, maria: maria.id });
  console.log(`Caso Firulais (PUBLICADO): ${firulais.id}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
