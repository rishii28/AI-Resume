/*
  Warnings:

  - Changed the type of `marketOutlook` on the `IndustryInsight` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "CoverLetter" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE "IndustryInsight" DROP COLUMN "marketOutlook",
ADD COLUMN     "marketOutlook" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "atsScore" DOUBLE PRECISION,
ADD COLUMN     "feedback" TEXT;
