-- DropIndex
DROP INDEX "CashFlow_type_occurredAt_idx";

-- DropIndex
DROP INDEX "CashFlow_invoiceId_idx";

-- DropIndex
DROP INDEX "InvoiceItem_productId_idx";

-- DropIndex
DROP INDEX "InvoiceItem_invoiceId_idx";

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT,
    "supplier" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "subtotalCents" INTEGER NOT NULL,
    "discountCents" INTEGER NOT NULL DEFAULT 0,
    "taxCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL,
    "notes" TEXT,
    "purchasedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PurchaseItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purchaseId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCostCents" INTEGER NOT NULL,
    "lineTotalCents" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PurchaseItem_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PurchaseItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_code_key" ON "Purchase"("code");
