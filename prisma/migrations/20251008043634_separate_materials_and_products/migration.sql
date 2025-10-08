/*
  Warnings:

  - You are about to drop the column `productId` on the `PurchaseItem` table. All the data in the column will be lost.
  - Added the required column `materialId` to the `PurchaseItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN "category" TEXT;

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "costCents" INTEGER NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'PCS',
    "quantityScale" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "category" TEXT,
    "supplier" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Production" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "producedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Production_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductionItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productionId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCostCents" INTEGER NOT NULL,
    "lineTotalCents" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductionItem_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductionItem_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PurchaseItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purchaseId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCostCents" INTEGER NOT NULL,
    "lineTotalCents" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PurchaseItem_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PurchaseItem_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PurchaseItem" ("createdAt", "id", "lineTotalCents", "purchaseId", "quantity", "unitCostCents", "updatedAt") SELECT "createdAt", "id", "lineTotalCents", "purchaseId", "quantity", "unitCostCents", "updatedAt" FROM "PurchaseItem";
DROP TABLE "PurchaseItem";
ALTER TABLE "new_PurchaseItem" RENAME TO "PurchaseItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Material_sku_key" ON "Material"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Production_code_key" ON "Production"("code");
