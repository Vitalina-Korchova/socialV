-- CreateTable
CREATE TABLE "avatar" (
    "id" SERIAL NOT NULL,
    "avatar_image_id" INTEGER NOT NULL,
    "required_level" INTEGER NOT NULL,
    "price_coins" INTEGER NOT NULL DEFAULT 0,
    "is_free" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "avatar_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "avatar" ADD CONSTRAINT "avatar_avatar_image_id_fkey" FOREIGN KEY ("avatar_image_id") REFERENCES "image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
