-- CreateTable
CREATE TABLE "user_shop_item" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "shop_item_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "is_obtained" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_shop_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_shop_item_user_id_shop_item_id_key" ON "user_shop_item"("user_id", "shop_item_id");

-- AddForeignKey
ALTER TABLE "user_shop_item" ADD CONSTRAINT "user_shop_item_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_shop_item" ADD CONSTRAINT "user_shop_item_shop_item_id_fkey" FOREIGN KEY ("shop_item_id") REFERENCES "shop_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
