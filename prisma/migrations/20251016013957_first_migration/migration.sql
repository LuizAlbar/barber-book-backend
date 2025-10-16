-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('BARBEIRO', 'ATENDENTE');

-- CreateEnum
CREATE TYPE "APPOINTMENT_STATUS" AS ENUM ('PENDENTE', 'COMPLETO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Barbershop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "address_number" TEXT NOT NULL,
    "neighbourhood" TEXT NOT NULL,
    "landmark" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "owner_id" TEXT NOT NULL,

    CONSTRAINT "Barbershop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "ROLE" NOT NULL,
    "phone_number" TEXT NOT NULL,
    "barbershop_id" TEXT NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "client_contact" TEXT NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL,
    "status" "APPOINTMENT_STATUS" NOT NULL DEFAULT 'PENDENTE',
    "barber_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "service_name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "time_taken" INTEGER NOT NULL,
    "barbershop_id" TEXT NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarberSchedule" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "days_of_week" INTEGER[],
    "open_time" TIME NOT NULL,
    "close_time" TIME NOT NULL,

    CONSTRAINT "BarberSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreakingTime" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "starting_time" TIME NOT NULL,
    "ending_time" TIME NOT NULL,

    CONSTRAINT "BreakingTime_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Barbershop" ADD CONSTRAINT "Barbershop_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_barbershop_id_fkey" FOREIGN KEY ("barbershop_id") REFERENCES "Barbershop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_barber_id_fkey" FOREIGN KEY ("barber_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_barbershop_id_fkey" FOREIGN KEY ("barbershop_id") REFERENCES "Barbershop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarberSchedule" ADD CONSTRAINT "BarberSchedule_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreakingTime" ADD CONSTRAINT "BreakingTime_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "BarberSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
