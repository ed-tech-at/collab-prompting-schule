-- AlterTable
ALTER TABLE "CollabSpace" ADD COLUMN     "title" TEXT,
ADD COLUMN     "toDelete" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CollabChat" ADD COLUMN     "toDelete" TIMESTAMP(3);
