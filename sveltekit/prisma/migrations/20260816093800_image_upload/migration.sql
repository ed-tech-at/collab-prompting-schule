-- AlterTable
ALTER TABLE "CollabSpace" ADD COLUMN     "imageUpload" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ChatEntryImage" (
    "id" SERIAL NOT NULL,
    "dataUrl" TEXT NOT NULL,
    "chatEntryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatEntryImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChatEntryImage" ADD CONSTRAINT "ChatEntryImage_chatEntryId_fkey" FOREIGN KEY ("chatEntryId") REFERENCES "ChatEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
