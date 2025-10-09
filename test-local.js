const { PrismaClient } = require('./src/generated/prisma');

async function testLocal() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://postgres:banhang-web@db.doaeklarzzcgaxlhvxgq.supabase.co:5432/postgres"
      }
    }
  });

  try {
    console.log('🔍 Testing local database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test summary API logic
    console.log('📊 Testing summary API logic...');
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
    const balance = income - expense;
    
    console.log('📈 Summary data:');
    console.log(`- Products: ${products}`);
    console.log(`- Customers: ${customers}`);
    console.log(`- Invoices: ${invoices}`);
    console.log(`- Purchases: ${purchases}`);
    console.log(`- Materials: ${materials}`);
    console.log(`- Income: ${income} VND`);
    console.log(`- Expense: ${expense} VND`);
    console.log(`- Balance: ${balance} VND`);
    
    // Test creating a sample product
    console.log('🧪 Testing create sample data...');
    const sampleProduct = await prisma.product.create({
      data: {
        name: "Test Product",
        priceCents: 100000,
        quantity: 10,
        unit: "PCS"
      }
    });
    console.log('✅ Sample product created:', sampleProduct.id);
    
    // Clean up
    await prisma.product.delete({ where: { id: sampleProduct.id } });
    console.log('✅ Sample product deleted');
    
    console.log('🎉 All tests passed! Database is working correctly.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLocal();


