/*
  Warnings:

  - You are about to drop the column `createdAt` on the `student` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[applicationNo]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `applicationNo` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `student` DROP COLUMN `createdAt`,
    ADD COLUMN `applicationNo` VARCHAR(10) NOT NULL,
    ADD COLUMN `isFormSubmitted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
    ADD COLUMN `selectedCourse` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Student_applicationNo_key` ON `Student`(`applicationNo`);
