/*
  Warnings:

  - You are about to drop the column `barber_id` on the `Appointment` table. All the data in the column will be lost.
  - Added the required column `employee_id` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "APPOINTMENT_STATUS" ADD VALUE 'CANCELADO';

-- DropForeignKey
ALTER TABLE "public"."Appointment" DROP CONSTRAINT "Appointment_barber_id_fkey";

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "barber_id",
ADD COLUMN     "employee_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
