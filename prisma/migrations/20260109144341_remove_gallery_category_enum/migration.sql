/*
  Warnings:

  - You are about to alter the column `category` on the `gallery` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `VarChar(50)`.

*/
-- AlterTable
ALTER TABLE `gallery` MODIFY `category` VARCHAR(50) NOT NULL;
