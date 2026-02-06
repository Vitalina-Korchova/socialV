/*
  Warnings:

  - You are about to drop the `avatar` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "item_shop_type" AS ENUM ('AVATAR', 'BACKGROUND', 'BADGE', 'BORDER');

-- DropForeignKey
ALTER TABLE "avatar" DROP CONSTRAINT "avatar_avatar_image_id_fkey";

-- DropTable
DROP TABLE "avatar";

-- CreateTable
CREATE TABLE "shop_item" (
    "id" SERIAL NOT NULL,
    "type" "item_shop_type" NOT NULL,
    "item_image_id" INTEGER,
    "required_level" INTEGER NOT NULL,
    "price_coins" INTEGER NOT NULL DEFAULT 0,
    "is_free" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "shop_item_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "shop_item" ADD CONSTRAINT "shop_item_item_image_id_fkey" FOREIGN KEY ("item_image_id") REFERENCES "image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
