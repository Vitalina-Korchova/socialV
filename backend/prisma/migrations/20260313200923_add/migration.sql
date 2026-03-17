-- AlterTable
ALTER TABLE "post" ADD COLUMN     "hashtags" TEXT;

-- AlterTable
ALTER TABLE "shop_item" ALTER COLUMN "badge_name" DROP DEFAULT;
