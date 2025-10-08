const { PrismaClient } = require('./src/generated/prisma');

async function testDatabase() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://postgres:banhang-web@db.doaeklarzzcgaxlhvxgq.supabase.co:5432/postgres"
      }
    }
  });

  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test summary data
    console.log('📊 Testing summary data...');
    const [products, customers, invoices, purchases, materials, incomeSum, expenseSum] = await Promise.all([
      prisma.product.count(),
      prisma.customer.count(),
      prisma.invoice.count(),
      prisma.purchase.count(),
      prisma.material.count(),
      prisma.cashFlow.aggregate({ _sum: { amountCents: true }, where: { type: "INCOME" } }),
      prisma.cashFlow.aggregate({ _sum: { amountCents: true }, where: { type: "EXPENSE" } }),
    ]);
    
    const income = incomeSum._sum.amountCents ?? 0;
    const expense = expenseSum._sum.amountCents ?? 0;
    
    console.log('📈 Summary data:');
    console.log(`- Products: ${products}`);
    console.log(`- Customers: ${customers}`);
    console.log(`- Invoices: ${invoices}`);
    console.log(`- Purchases: ${purchases}`);
    console.log(`- Materials: ${materials}`);
    console.log(`- Income: ${income}`);
    console.log(`- Expense: ${expense}`);
    console.log(`- Balance: ${income - expense}`);
    
    console.log('✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
