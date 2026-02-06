-- DropForeignKey
ALTER TABLE "used_refresh_token" DROP CONSTRAINT "used_refresh_token_user_id_fkey";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "avatar_url" TEXT NOT NULL DEFAULT 'image_url';

-- AddForeignKey
ALTER TABLE "used_refresh_token" ADD CONSTRAINT "used_refresh_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
