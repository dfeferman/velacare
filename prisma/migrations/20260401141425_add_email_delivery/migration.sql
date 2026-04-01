-- CreateTable
CREATE TABLE "email_deliveries" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "kundeId" UUID NOT NULL,
    "periodKey" TEXT NOT NULL,
    "providerMsgId" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_deliveries_kundeId_idx" ON "email_deliveries"("kundeId");

-- CreateIndex
CREATE UNIQUE INDEX "email_deliveries_kind_kundeId_periodKey_key" ON "email_deliveries"("kind", "kundeId", "periodKey");

-- AddForeignKey
ALTER TABLE "email_deliveries" ADD CONSTRAINT "email_deliveries_kundeId_fkey" FOREIGN KEY ("kundeId") REFERENCES "kunden_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
