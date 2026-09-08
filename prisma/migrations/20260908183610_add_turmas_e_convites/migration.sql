-- AlterTable
ALTER TABLE "Simulation" ADD COLUMN     "turmaId" TEXT;

-- CreateTable
CREATE TABLE "Turma" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "schoolName" TEXT,
    "schoolYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Turma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TurmaInvite" (
    "id" TEXT NOT NULL,
    "turmaId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "label" TEXT,
    "expiresAt" TIMESTAMP(3),
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "revokedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TurmaInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TurmaMembership" (
    "id" TEXT NOT NULL,
    "turmaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "inviteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TurmaMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Turma_slug_key" ON "Turma"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TurmaInvite_tokenHash_key" ON "TurmaInvite"("tokenHash");

-- CreateIndex
CREATE INDEX "TurmaInvite_turmaId_idx" ON "TurmaInvite"("turmaId");

-- CreateIndex
CREATE INDEX "TurmaMembership_userId_idx" ON "TurmaMembership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TurmaMembership_turmaId_userId_key" ON "TurmaMembership"("turmaId", "userId");

-- CreateIndex
CREATE INDEX "Simulation_turmaId_idx" ON "Simulation"("turmaId");

-- AddForeignKey
ALTER TABLE "Simulation" ADD CONSTRAINT "Simulation_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurmaInvite" ADD CONSTRAINT "TurmaInvite_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurmaInvite" ADD CONSTRAINT "TurmaInvite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurmaMembership" ADD CONSTRAINT "TurmaMembership_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurmaMembership" ADD CONSTRAINT "TurmaMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurmaMembership" ADD CONSTRAINT "TurmaMembership_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "TurmaInvite"("id") ON DELETE SET NULL ON UPDATE CASCADE;
