-- CreateTable
CREATE TABLE "user_reset_password" (
    "id" SERIAL NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_reset_password_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_reset_password" ADD CONSTRAINT "user_reset_password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
