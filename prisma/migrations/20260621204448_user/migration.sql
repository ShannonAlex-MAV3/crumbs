-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACT', 'INA');

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('GOOGLE');

-- CreateTable
CREATE TABLE "t_user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "picture" TEXT,
    "provider" "Provider" NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACT',

    CONSTRAINT "t_user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_user_email_key" ON "t_user"("email");
