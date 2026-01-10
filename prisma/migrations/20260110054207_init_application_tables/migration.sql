/*
  Warnings:

  - You are about to alter the column `role` on the `admin_users` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `VarChar(191)`.
  - You are about to drop the `admissions` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `admin_users` MODIFY `role` VARCHAR(191) NOT NULL DEFAULT 'moderator';

-- DropTable
DROP TABLE `admissions`;

-- CreateTable
CREATE TABLE `Student` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `mobileNumber` VARCHAR(15) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Student_email_key`(`email`),
    UNIQUE INDEX `Student_mobileNumber_key`(`mobileNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BbaApplication` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `fullName` VARCHAR(255) NOT NULL,
    `gender` VARCHAR(20) NOT NULL,
    `dateOfBirth` VARCHAR(50) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `nationality` VARCHAR(50) NOT NULL,
    `aadhaarNumber` VARCHAR(20) NOT NULL,
    `mobileNumber` VARCHAR(15) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `permanentAddress` TEXT NOT NULL,
    `corrAddressLine` VARCHAR(255) NOT NULL,
    `corrState` VARCHAR(100) NOT NULL,
    `corrDistrict` VARCHAR(100) NOT NULL,
    `corrPinCode` VARCHAR(10) NOT NULL,
    `fatherName` VARCHAR(191) NOT NULL,
    `fatherMobile` VARCHAR(191) NOT NULL,
    `fatherOccupation` VARCHAR(191) NOT NULL,
    `fatherIncome` VARCHAR(191) NOT NULL,
    `motherName` VARCHAR(191) NOT NULL,
    `motherMobile` VARCHAR(191) NOT NULL,
    `motherOccupation` VARCHAR(191) NOT NULL,
    `motherIncome` VARCHAR(191) NOT NULL,
    `guardianName` VARCHAR(191) NOT NULL,
    `guardianRelation` VARCHAR(191) NOT NULL,
    `guardianMobile` VARCHAR(191) NOT NULL,
    `guardianAddress` TEXT NOT NULL,
    `c10Board` VARCHAR(191) NOT NULL,
    `c10School` VARCHAR(191) NOT NULL,
    `c10Year` VARCHAR(191) NOT NULL,
    `c10MaxMarks` VARCHAR(191) NOT NULL,
    `c10MarksObt` VARCHAR(191) NOT NULL,
    `c10Percentage` VARCHAR(191) NOT NULL,
    `c12Board` VARCHAR(191) NOT NULL,
    `c12School` VARCHAR(191) NOT NULL,
    `c12Year` VARCHAR(191) NOT NULL,
    `c12MaxMarks` VARCHAR(191) NOT NULL,
    `c12MarksObt` VARCHAR(191) NOT NULL,
    `c12Percentage` VARCHAR(191) NOT NULL,
    `passed10Plus2` VARCHAR(191) NOT NULL DEFAULT 'No',
    `hostelRequired` VARCHAR(191) NOT NULL DEFAULT 'No',
    `hostelType` VARCHAR(191) NULL,
    `guardianConsent` VARCHAR(191) NOT NULL DEFAULT 'No',
    `declaration` VARCHAR(191) NOT NULL DEFAULT 'false',
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MbaApplication` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `firstName` VARCHAR(100) NOT NULL,
    `middleName` VARCHAR(100) NULL,
    `lastName` VARCHAR(100) NOT NULL,
    `gender` VARCHAR(20) NOT NULL,
    `dateOfBirth` VARCHAR(50) NOT NULL,
    `bloodGroup` VARCHAR(10) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `aadhaarNumber` VARCHAR(20) NOT NULL,
    `panNumber` VARCHAR(20) NOT NULL,
    `mobileNumber` VARCHAR(15) NOT NULL,
    `permAddressLine1` VARCHAR(255) NOT NULL,
    `permCity` VARCHAR(100) NOT NULL,
    `permDistrict` VARCHAR(100) NOT NULL,
    `permState` VARCHAR(100) NOT NULL,
    `permPinCode` VARCHAR(10) NOT NULL,
    `qualifyingExams` TEXT NULL,
    `examScore` VARCHAR(191) NULL,
    `degree` VARCHAR(191) NOT NULL,
    `specialisation` VARCHAR(191) NOT NULL,
    `c10Board` VARCHAR(191) NOT NULL,
    `c10Inst` VARCHAR(191) NOT NULL,
    `c10Year` VARCHAR(191) NOT NULL,
    `c10Marks` VARCHAR(191) NOT NULL,
    `c12Board` VARCHAR(191) NOT NULL,
    `c12Inst` VARCHAR(191) NOT NULL,
    `c12Year` VARCHAR(191) NOT NULL,
    `c12Marks` VARCHAR(191) NOT NULL,
    `gradBoard` VARCHAR(191) NOT NULL,
    `gradInst` VARCHAR(191) NOT NULL,
    `gradYear` VARCHAR(191) NOT NULL,
    `gradMarks` VARCHAR(191) NOT NULL,
    `hasWorkExp` VARCHAR(191) NOT NULL DEFAULT 'no',
    `workExpDetails` TEXT NULL,
    `photoUrl` VARCHAR(500) NULL,
    `signatureUrl` VARCHAR(500) NULL,
    `marksheet10Url` VARCHAR(500) NULL,
    `marksheetGradUrl` VARCHAR(500) NULL,
    `declaration` VARCHAR(191) NOT NULL DEFAULT 'false',
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BbaApplication` ADD CONSTRAINT `BbaApplication_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MbaApplication` ADD CONSTRAINT `MbaApplication_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
