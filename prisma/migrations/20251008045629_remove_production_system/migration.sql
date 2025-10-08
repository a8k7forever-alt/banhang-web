/*
  Warnings:

  - You are about to drop the `Production` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductionItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Production";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ProductionItem";
PRAGMA foreign_keys=on;
