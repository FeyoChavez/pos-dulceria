import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando la siembra de datos de prueba...');

  // 1. Limpiar base de datos para evitar duplicados si corremos el script de nuevo
  await prisma.saleItem.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.tenant.deleteMany({});

  // 2. Crear una tienda de prueba (Tenant)
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Dulcería El Paraíso Dulce',
    },
  });
  console.log(`✅ Tienda creada: ${tenant.name} (ID: ${tenant.id})`);

  // 3. Crear Usuarios (Administrador y Cajero)
  // Nota: En producción las contraseñas deben ir encriptadas con bcrypt, aquí usamos texto plano solo para pruebas rápidas
  const adminUser = await prisma.user.create({
    data: {
      name: 'Juan Admin',
      email: 'admin@dulceria.com',
      password: 'password123',
      role: Role.ADMIN,
      tenantId: tenant.id,
    },
  });

  const cashierUser = await prisma.user.create({
    data: {
      name: 'Alfredo Cajero',
      email: 'cajero@dulceria.com',
      password: 'password123',
      role: Role.CASHIER,
      tenantId: tenant.id,
    },
  });
  console.log('✅ Usuarios de prueba creados (admin@dulceria.com / cajero@dulceria.com)');

  // 4. Crear Catálogo de Dulces de prueba (Piezas y Granel)
  const productsData = [
    // Dulces por pieza
    {
      name: 'Paleta Payaso Grande',
      barcode: '7501000111223', // Código ficticio de barras
      priceCost: 12.50,
      priceSale: 18.00,
      stock: 50,
      isByWeight: false,
      tenantId: tenant.id,
    },
    {
      name: 'Chocolate Carlos V',
      barcode: '7501005223344',
      priceCost: 7.00,
      priceSale: 11.50,
      stock: 120,
      isByWeight: false,
      tenantId: tenant.id,
    },
    {
      name: 'Pulparindo Original',
      barcode: '7501056778899',
      priceCost: 4.50,
      priceSale: 7.00,
      stock: 200,
      isByWeight: false,
      tenantId: tenant.id,
    },
    // Dulces a granel (por peso - kilogramos)
    {
      name: 'Gomitas de Ovejitas (Granel)',
      barcode: 'GRANEL-GOM-01', // ID personalizado o pesado en caja
      priceCost: 45.00,  // Costo por kilo
      priceSale: 85.00,  // Venta por kilo
      stock: 15.500,     // 15.5 kilos disponibles
      isByWeight: true,
      tenantId: tenant.id,
    },
    {
      name: 'Manguitos con Chile (Granel)',
      barcode: 'GRANEL-MAN-02',
      priceCost: 55.00,
      priceSale: 98.00,
      stock: 10.000,     // 10 kilos disponibles
      isByWeight: true,
      tenantId: tenant.id,
    }
  ];

  for (const product of productsData) {
    await prisma.product.create({ data: product });
  }

  console.log('✅ Catálogo de dulces iniciales inyectado con éxito.');
  console.log('🎉 ¡Siembra completada con éxito!');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });