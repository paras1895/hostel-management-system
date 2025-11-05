-- CreateTable
CREATE TABLE `RoomInvite` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fromStudentId` INTEGER NOT NULL,
    `toStudentId` INTEGER NOT NULL,
    `roomId` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `respondedAt` DATETIME(3) NULL,

    UNIQUE INDEX `one_pending_per_room_target`(`toStudentId`, `roomId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RoomInvite` ADD CONSTRAINT `RoomInvite_fromStudentId_fkey` FOREIGN KEY (`fromStudentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomInvite` ADD CONSTRAINT `RoomInvite_toStudentId_fkey` FOREIGN KEY (`toStudentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomInvite` ADD CONSTRAINT `RoomInvite_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
