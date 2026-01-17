-- CreateTable
CREATE TABLE "used_refresh_token" (
    "id" SERIAL NOT NULL,
    "token_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "used_refresh_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "used_refresh_token_token_id_key" ON "used_refresh_token"("token_id");

-- AddForeignKey
ALTER TABLE "used_refresh_token" ADD CONSTRAINT "used_refresh_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
