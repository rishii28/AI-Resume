/*
  Warnings:

  - You are about to drop the column `credits` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `freeImagesUsed` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `freeVideosUsed` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastGenerationAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionStatus` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionTier` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `totalGenerations` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `CreditPackage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Generation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Purchase` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Generation" DROP CONSTRAINT "Generation_userId_fkey";

-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "credits",
DROP COLUMN "freeImagesUsed",
DROP COLUMN "freeVideosUsed",
DROP COLUMN "lastGenerationAt",
DROP COLUMN "subscriptionId",
DROP COLUMN "subscriptionStatus",
DROP COLUMN "subscriptionTier",
DROP COLUMN "totalGenerations";

-- DropTable
DROP TABLE "CreditPackage";

-- DropTable
DROP TABLE "Generation";

-- DropTable
DROP TABLE "Purchase";
