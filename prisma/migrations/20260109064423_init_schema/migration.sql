-- CreateTable
CREATE TABLE `admissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phoneNumber` VARCHAR(15) NOT NULL,
    `course` TEXT NOT NULL,
    `dateOfBirth` DATE NOT NULL,
    `category` ENUM('General', 'OBC', 'SC', 'ST') NOT NULL,
    `fatherName` VARCHAR(255) NOT NULL,
    `fatherOccupation` VARCHAR(100) NULL,
    `fatherPhoneNumber` VARCHAR(15) NULL,
    `motherName` VARCHAR(255) NOT NULL,
    `motherOccupation` VARCHAR(100) NULL,
    `motherPhoneNumber` VARCHAR(15) NULL,
    `addressLine1` TEXT NOT NULL,
    `addressLine2` TEXT NULL,
    `state` VARCHAR(100) NOT NULL,
    `district` VARCHAR(100) NOT NULL,
    `pinCode` VARCHAR(10) NOT NULL,
    `passportPhotograph` VARCHAR(255) NULL,
    `qualifyingExamAppeared` VARCHAR(100) NULL,
    `qualifyingExamPercentageOrPercentile` VARCHAR(50) NULL,
    `graduationDiscipline` VARCHAR(100) NULL,
    `graduationOtherDisciplineDetails` TEXT NULL,
    `graduationSpecialisation` VARCHAR(100) NULL,
    `otherQualification` TEXT NULL,
    `postGraduationDegree` VARCHAR(100) NULL,
    `percentageMarksClass10` DECIMAL(5, 2) NULL,
    `class12Stream` ENUM('Science', 'Commerce', 'Arts') NULL,
    `percentageMarksClass12` DECIMAL(5, 2) NULL,
    `percentageMarksGraduation` DECIMAL(5, 2) NULL,
    `percentageMarksPostGraduation` DECIMAL(5, 2) NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admissions_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gallery` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `image` VARCHAR(500) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `category` ENUM('campus', 'facilities', 'academic', 'events', 'sports') NOT NULL,
    `description` TEXT NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'moderator') NOT NULL DEFAULT 'moderator',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastLogin` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admin_users_username_key`(`username`),
    UNIQUE INDEX `admin_users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
