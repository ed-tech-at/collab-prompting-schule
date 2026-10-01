-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "cryptVersion" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollabSpace" (
    "id" SERIAL NOT NULL,
    "base_url" TEXT,
    "api_key" TEXT,
    "model" TEXT,
    "password" TEXT NOT NULL,
    "cryptVersion" INTEGER NOT NULL DEFAULT 0,
    "question" TEXT,
    "system_prompt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollabSpace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollabChat" (
    "id" SERIAL NOT NULL,
    "collabSpaceId" INTEGER NOT NULL,
    "teacher_rating" TEXT,
    "student_rating" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollabChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatEntry" (
    "id" SERIAL NOT NULL,
    "role" TEXT,
    "message" TEXT,
    "collabChatId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_email_key" ON "Teacher"("email");

-- AddForeignKey
ALTER TABLE "CollabChat" ADD CONSTRAINT "CollabChat_collabSpaceId_fkey" FOREIGN KEY ("collabSpaceId") REFERENCES "CollabSpace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatEntry" ADD CONSTRAINT "ChatEntry_collabChatId_fkey" FOREIGN KEY ("collabChatId") REFERENCES "CollabChat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
