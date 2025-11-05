/*
  Warnings:

  - You are about to drop the `maintenance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `maintenance` DROP FOREIGN KEY `Maintenance_roomId_fkey`;

-- DropTable
DROP TABLE `maintenance`;
