/*
  Warnings:

  - You are about to alter the column `declaration` on the `mbaapplication` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `mbaapplication` MODIFY `declaration` VARCHAR(191) NULL DEFAULT 'false',
    MODIFY `status` VARCHAR(191) NULL DEFAULT 'pending';
