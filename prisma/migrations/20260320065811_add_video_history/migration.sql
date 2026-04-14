-- CreateTable
CREATE TABLE "GeneratedVideo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "model" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GeneratedVideo_userId_idx" ON "GeneratedVideo"("userId");

-- CreateIndex
CREATE INDEX "GeneratedVideo_createdAt_idx" ON "GeneratedVideo"("createdAt");

-- AddForeignKey
ALTER TABLE "GeneratedVideo" ADD CONSTRAINT "GeneratedVideo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
