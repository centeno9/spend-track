/*
  Warnings:

  - You are about to drop the column `total` on the `expenses` table. All the data in the column will be lost.
  - Added the required column `totalCents` to the `expenses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."expenses" DROP COLUMN "total",
ADD COLUMN     "totalCents" INTEGER NOT NULL;
