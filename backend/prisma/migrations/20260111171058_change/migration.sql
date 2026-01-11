/*
  Warnings:

  - You are about to drop the column `codeHash` on the `user_reset_password` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `user_reset_password` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `user_reset_password` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `user_reset_password` table. All the data in the column will be lost.
  - Added the required column `code_hash` to the `user_reset_password` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `user_reset_password` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `user_reset_password` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_reset_password" DROP CONSTRAINT "user_reset_password_userId_fkey";

-- AlterTable
ALTER TABLE "user_reset_password" DROP COLUMN "codeHash",
DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "userId",
ADD COLUMN     "code_hash" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "user_reset_password" ADD CONSTRAINT "user_reset_password_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
