/*
  Warnings:

  - Added the required column `year` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `student` ADD COLUMN `year` VARCHAR(191) NOT NULL;
