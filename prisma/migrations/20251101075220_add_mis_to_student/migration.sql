/*
  Warnings:

  - A unique constraint covering the columns `[mis]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mis` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `student` ADD COLUMN `mis` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Student_mis_key` ON `Student`(`mis`);
