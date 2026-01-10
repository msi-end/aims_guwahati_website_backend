/*
  Warnings:

  - You are about to drop the column `c10Board` on the `mbaapplication` table. All the data in the column will be lost.
  - You are about to drop the column `c10Inst` on the `mbaapplication` table. All the data in the column will be lost.
  - You are about to drop the column `c10Marks` on the `mbaapplication` table. All the data in the column will be lost.
  - You are about to drop the column `c10Year` on the `mbaapplication` table. All the data in the column will be lost.
  - You are about to drop the column `c12Board` on the `mbaapplication` table. All the data in the column will be lost.
  - You are about to drop the column `c12Inst` on the `mbaapplication` table. All the data in the column will be lost.
  - You are about to drop the column `c12Marks` on the `mbaapplication` table. All the data in the column will be lost.
  - You are about to drop the column `c12Year` on the `mbaapplication` table. All the data in the column will be lost.
  - You are about to drop the column `examScore` on the `mbaapplication` table. All the data in the column will be lost.
  - You are about to drop the column `gradBoard` on the `mbaapplication` table. All the data in the column will be lost.
  - You are about to drop the column `gradInst` on the `mbaapplication` table. All the data in the column will be lost.
  - You are about to drop the column `gradMarks` on the `mbaapplication` table. All the data in the column will be lost.
  - You are about to drop the column `gradYear` on the `mbaapplication` table. All the data in the column will be lost.
  - You are about to drop the column `hasWorkExp` on the `mbaapplication` table. All the data in the column will be lost.
  - You are about to drop the column `workExpDetails` on the `mbaapplication` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `MbaApplication` table without a default value. This is not possible if the table is not empty.
  - Made the column `declaration` on table `mbaapplication` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `bbaapplication` ADD COLUMN `otherQual` TEXT NULL;

-- AlterTable
ALTER TABLE `mbaapplication` DROP COLUMN `c10Board`,
    DROP COLUMN `c10Inst`,
    DROP COLUMN `c10Marks`,
    DROP COLUMN `c10Year`,
    DROP COLUMN `c12Board`,
    DROP COLUMN `c12Inst`,
    DROP COLUMN `c12Marks`,
    DROP COLUMN `c12Year`,
    DROP COLUMN `examScore`,
    DROP COLUMN `gradBoard`,
    DROP COLUMN `gradInst`,
    DROP COLUMN `gradMarks`,
    DROP COLUMN `gradYear`,
    DROP COLUMN `hasWorkExp`,
    DROP COLUMN `workExpDetails`,
    ADD COLUMN `academicRows` TEXT NULL,
    ADD COLUMN `casteCertificateUrl` VARCHAR(500) NULL,
    ADD COLUMN `cgpa` VARCHAR(191) NULL,
    ADD COLUMN `conversionFormula` VARCHAR(191) NULL,
    ADD COLUMN `corrAddressLine1` VARCHAR(255) NULL,
    ADD COLUMN `corrCity` VARCHAR(100) NULL,
    ADD COLUMN `corrDistrict` VARCHAR(100) NULL,
    ADD COLUMN `corrPinCode` VARCHAR(10) NULL,
    ADD COLUMN `corrPoliceStation` VARCHAR(100) NULL,
    ADD COLUMN `corrPostOffice` VARCHAR(100) NULL,
    ADD COLUMN `corrState` VARCHAR(100) NULL DEFAULT 'Assam',
    ADD COLUMN `correspondenceSameAsPermanent` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `degreeOther` VARCHAR(191) NULL,
    ADD COLUMN `extraCurricular` TEXT NULL,
    ADD COLUMN `fatherMobile` VARCHAR(191) NULL,
    ADD COLUMN `fatherName` VARCHAR(191) NULL,
    ADD COLUMN `fatherOccupation` VARCHAR(191) NULL,
    ADD COLUMN `guardianAddress` TEXT NULL,
    ADD COLUMN `guardianMobile` VARCHAR(191) NULL,
    ADD COLUMN `guardianName` VARCHAR(191) NULL,
    ADD COLUMN `guardianOccupation` VARCHAR(191) NULL,
    ADD COLUMN `guardianRelation` VARCHAR(191) NULL,
    ADD COLUMN `hasWorkExperience` VARCHAR(191) NULL DEFAULT 'no',
    ADD COLUMN `hostelRequired` VARCHAR(191) NULL DEFAULT 'no',
    ADD COLUMN `hostelSpecialReq` TEXT NULL,
    ADD COLUMN `hostelType` VARCHAR(191) NULL,
    ADD COLUMN `marksheet12Url` VARCHAR(500) NULL,
    ADD COLUMN `motherMobile` VARCHAR(191) NULL,
    ADD COLUMN `motherName` VARCHAR(191) NULL,
    ADD COLUMN `motherOccupation` VARCHAR(191) NULL,
    ADD COLUMN `nationality` VARCHAR(50) NULL,
    ADD COLUMN `permPoliceStation` VARCHAR(100) NULL,
    ADD COLUMN `permPostOffice` VARCHAR(100) NULL,
    ADD COLUMN `qualifyingExamOther` VARCHAR(191) NULL,
    ADD COLUMN `qualifyingExamScore` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `workExperienceRows` TEXT NULL,
    MODIFY `permState` VARCHAR(100) NULL DEFAULT 'Assam',
    MODIFY `declaration` BOOLEAN NOT NULL DEFAULT false;
