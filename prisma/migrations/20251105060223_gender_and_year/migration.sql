/*
  Warnings:

  - You are about to alter the column `year` on the `student` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.

*/
-- AlterTable
ALTER TABLE `room` ADD COLUMN `groupGender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    ADD COLUMN `groupYear` ENUM('FY', 'SY', 'TY', 'BE') NULL;

-- AlterTable
ALTER TABLE `student` ADD COLUMN `gender` ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL DEFAULT 'OTHER',
    MODIFY `year` ENUM('FY', 'SY', 'TY', 'BE') NOT NULL;
