-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "priceCents" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'PCS',
    "quantityScale" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("createdAt", "description", "id", "isActive", "name", "priceCents", "quantity", "sku", "updatedAt") SELECT "createdAt", "description", "id", "isActive", "name", "priceCents", "quantity", "sku", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
