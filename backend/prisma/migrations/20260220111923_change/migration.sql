/*
  Warnings:

  - You are about to drop the column `is_obtained` on the `user_shop_item` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "action_type_score" AS ENUM ('CREATE_POST', 'SET_LIKE', 'SET_REPOST', 'SET_BOOKMARK', 'SET_COMMENT', 'RECEIVE_LIKE', 'RECEIVE_REPOST', 'RECEIVE_COMMENT', 'START_FOLLOW', 'RECEIVE_FOLLOW', 'CREATE_MESSAGE', 'RECEIVE_MESSAGE');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "amount_xp" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "user_shop_item" DROP COLUMN "is_obtained";

-- CreateTable
CREATE TABLE "xp_rules" (
    "id" SERIAL NOT NULL,
    "type" "action_type_score" NOT NULL,
    "xp_amount" INTEGER NOT NULL DEFAULT 5,
    "coins_amount" INTEGER NOT NULL DEFAULT 5,
    "daily_limit" INTEGER NOT NULL,

    CONSTRAINT "xp_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_level_rules" (
    "id" SERIAL NOT NULL,
    "level" INTEGER NOT NULL,
    "required_experience" INTEGER NOT NULL,
    "reward_coins" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_level_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_level_rules_level_key" ON "user_level_rules"("level");
