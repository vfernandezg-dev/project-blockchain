import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Limpieza
  await prisma.certificate.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.case.deleteMany();
  await prisma.user.deleteMany();

  // Usuarios (uno por rol + donantes)
  const admin = await prisma.user.create({
    data: { wallet: "vitalpaws.eth", name: "VitalPaws (Admin)", role: "ADMIN" },
  });
  const vet = await prisma.user.create({
    data: { wallet: "vet-trujillo.eth", name: "Dra. Ana - Centro Vet. Trujillo", role: "VET" },
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
      goalEth: 0.1,
      diagnosis: "Displasia de cadera severa. Requiere protesis personalizada.",
      status: "PUBLICADO",
      vetId: vet.id,
    },
  });

  // Una donacion previa para mostrar avance
  await prisma.donation.create({
    data: {
      caseId: firulais.id,
      donorId: maria.id,
      amountEth: 0.03,
      txHash: "sim-0xseed0001",
    },
  });
  await prisma.case.update({ where: { id: firulais.id }, data: { raisedEth: 0.03 } });

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
