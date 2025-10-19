/*
  Warnings:

  - You are about to drop the column `owner_id` on the `Barbershop` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `Barbershop` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Barbershop" DROP CONSTRAINT "Barbershop_owner_id_fkey";

-- AlterTable
ALTER TABLE "Barbershop" DROP COLUMN "owner_id",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Barbershop" ADD CONSTRAINT "Barbershop_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
