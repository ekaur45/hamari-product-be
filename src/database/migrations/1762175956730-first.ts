import { MigrationInterface, QueryRunner } from "typeorm";

export class First1762175956730 implements MigrationInterface {
    name = 'First1762175956730'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user_details\` (\`id\` varchar(36) NOT NULL, \`userId\` varchar(255) NOT NULL, \`phone\` varchar(255) NULL, \`address\` varchar(255) NULL, \`dateOfBirth\` timestamp NULL, \`profileImage\` varchar(255) NULL, \`bio\` text NULL, \`skills\` text NULL, UNIQUE INDEX \`REL_5261d2468b1288b347d58e8b54\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`academies\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(200) NOT NULL, \`description\` varchar(500) NULL, \`address\` varchar(200) NULL, \`phone\` varchar(20) NULL, \`email\` varchar(100) NULL, \`logo\` varchar(255) NULL, \`status\` enum ('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active', \`monthlyFee\` decimal(10,2) NOT NULL DEFAULT '0.00', \`individualClassFee\` decimal(10,2) NOT NULL DEFAULT '0.00', \`ownerId\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`isDeleted\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_education\` (\`id\` varchar(36) NOT NULL, \`userId\` varchar(255) NOT NULL, \`instituteName\` varchar(255) NOT NULL, \`degreeName\` varchar(255) NOT NULL, \`startedYear\` int NOT NULL, \`endedYear\` int NULL, \`isStillStudying\` tinyint NOT NULL DEFAULT 0, \`remarks\` text NULL, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`isDeleted\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`parent_children\` (\`id\` varchar(36) NOT NULL, \`parentId\` varchar(255) NOT NULL, \`childId\` varchar(255) NOT NULL, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`isDeleted\` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX \`IDX_97b52ebf6575c48adab29cb650\` (\`parentId\`, \`childId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`parents\` (\`id\` varchar(36) NOT NULL, \`userId\` varchar(255) NOT NULL, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`isDeleted\` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX \`REL_f1e08daeefd9c2e5def5746be7\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`student_class_attendances\` (\`id\` varchar(36) NOT NULL, \`studentId\` varchar(255) NOT NULL, \`classBookingId\` varchar(255) NOT NULL, \`date\` date NOT NULL, \`status\` enum ('present', 'absent', 'leave', 'excused') NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`class_bookings\` (\`id\` varchar(36) NOT NULL, \`studentId\` varchar(255) NOT NULL, \`classId\` varchar(255) NOT NULL, \`month\` enum ('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December') NOT NULL, \`status\` enum ('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending', \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`isDeleted\` tinyint NOT NULL DEFAULT 0, \`classEntityId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`classes\` (\`id\` varchar(36) NOT NULL, \`teacherId\` varchar(255) NOT NULL, \`subjectId\` varchar(255) NOT NULL, \`price\` decimal(10,2) NOT NULL DEFAULT '0.00', \`startTime\` time NOT NULL, \`endTime\` time NOT NULL, \`duration\` int NOT NULL DEFAULT '0', \`maxStudents\` int NOT NULL DEFAULT '0', \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`isDeleted\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`subjects\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(150) NOT NULL, \`description\` text NULL, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`isDeleted\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`teacher_subjects\` (\`id\` varchar(36) NOT NULL, \`teacherId\` varchar(255) NOT NULL, \`subjectId\` varchar(255) NOT NULL, \`fee\` decimal(10,2) NULL, \`skillLevel\` enum ('Started', 'Medium', 'Expert') NOT NULL DEFAULT 'Started', \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`isDeleted\` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX \`IDX_8e762322ca7fbbe06ab8eb1ea6\` (\`teacherId\`, \`subjectId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`availablility\` (\`id\` varchar(36) NOT NULL, \`teacherId\` varchar(255) NOT NULL, \`dayOfWeek\` enum ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL, \`startTime\` time NOT NULL, \`endTime\` time NOT NULL, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`isDeleted\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`teachers\` (\`id\` varchar(36) NOT NULL, \`userId\` varchar(255) NOT NULL, \`tagline\` varchar(255) NULL, \`yearsOfExperience\` int NULL, \`preferredSubject\` varchar(255) NULL, \`specialization\` varchar(255) NULL, \`hourlyRate\` int NULL, \`isVerified\` tinyint NOT NULL DEFAULT 1, \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` timestamp NOT NULL ON UPDATE CURRENT_TIMESTAMP, \`isDeleted\` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX \`REL_4d8041cbc103a5142fa2f2afad\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`teacher_bookings\` (\`id\` varchar(36) NOT NULL, \`teacherId\` varchar(255) NOT NULL, \`studentId\` varchar(255) NOT NULL, \`teacherSubjectId\` varchar(255) NOT NULL, \`availabilityId\` varchar(255) NOT NULL, \`status\` enum ('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending', \`totalAmount\` decimal(10,2) NULL, \`paidAmount\` decimal(10,2) NULL, \`dueAmount\` decimal(10,2) NULL, \`discountAmount\` decimal(10,2) NULL, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`isDeleted\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`students\` (\`id\` varchar(36) NOT NULL, \`userId\` varchar(255) NOT NULL, \`tagline\` varchar(255) NULL, \`parentId\` varchar(255) NOT NULL, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`isDeleted\` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX \`REL_e0208b4f964e609959aff431bf\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`firstName\` varchar(100) NOT NULL, \`lastName\` varchar(100) NOT NULL, \`email\` varchar(255) NOT NULL, \`username\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`role\` enum ('Admin', 'Teacher', 'Parent', 'Student', 'Academy Owner', 'Other') NOT NULL DEFAULT 'Other', \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`isDeleted\` tinyint NOT NULL DEFAULT 0, \`detailsId\` varchar(36) NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), UNIQUE INDEX \`REL_a8687924ae4d52f05db87f3352\` (\`detailsId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`courses\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`isDeleted\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`academy_teachers\` (\`id\` varchar(36) NOT NULL, \`academyId\` varchar(255) NOT NULL, \`teacherId\` varchar(255) NOT NULL, \`role\` enum ('Teacher', 'Senior Teacher', 'Head Teacher', 'Admin') NOT NULL DEFAULT 'Teacher', \`status\` enum ('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active', \`salary\` decimal(10,2) NULL, \`notes\` text NULL, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`isDeleted\` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX \`IDX_65d5b7a199f6f2f30aec4310a3\` (\`academyId\`, \`teacherId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user_details\` ADD CONSTRAINT \`FK_5261d2468b1288b347d58e8b540\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`academies\` ADD CONSTRAINT \`FK_482f13c107afb2a671e2bc46fd2\` FOREIGN KEY (\`ownerId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_education\` ADD CONSTRAINT \`FK_98f09242a36729ef251819d19a4\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`parent_children\` ADD CONSTRAINT \`FK_ef3f10e877846e162781086e846\` FOREIGN KEY (\`parentId\`) REFERENCES \`parents\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`parent_children\` ADD CONSTRAINT \`FK_e3bbd2e9386b2f512e61625d62f\` FOREIGN KEY (\`childId\`) REFERENCES \`students\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`parents\` ADD CONSTRAINT \`FK_f1e08daeefd9c2e5def5746be7e\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`student_class_attendances\` ADD CONSTRAINT \`FK_51826f0fb7f602dc471b95978d0\` FOREIGN KEY (\`studentId\`) REFERENCES \`students\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`student_class_attendances\` ADD CONSTRAINT \`FK_b496adeb96beabeec413ac61baa\` FOREIGN KEY (\`classBookingId\`) REFERENCES \`class_bookings\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`class_bookings\` ADD CONSTRAINT \`FK_31c0bf5d0bae94266f2bd3f99f6\` FOREIGN KEY (\`studentId\`) REFERENCES \`students\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`class_bookings\` ADD CONSTRAINT \`FK_ee611bcc77ea9cbb2a3d747d22b\` FOREIGN KEY (\`classEntityId\`) REFERENCES \`classes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD CONSTRAINT \`FK_4b7ac7a7eb91f3e04229c7c0b6f\` FOREIGN KEY (\`teacherId\`) REFERENCES \`teachers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD CONSTRAINT \`FK_6df8dacbeed6e130c7032bf6f74\` FOREIGN KEY (\`subjectId\`) REFERENCES \`subjects\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`teacher_subjects\` ADD CONSTRAINT \`FK_2013034e3c170743cbd5fda6de9\` FOREIGN KEY (\`teacherId\`) REFERENCES \`teachers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`teacher_subjects\` ADD CONSTRAINT \`FK_8b5bb4420cea1e9e5a988ec3e11\` FOREIGN KEY (\`subjectId\`) REFERENCES \`subjects\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`availablility\` ADD CONSTRAINT \`FK_01df5869404d4291184c6141b3f\` FOREIGN KEY (\`teacherId\`) REFERENCES \`teachers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`teachers\` ADD CONSTRAINT \`FK_4d8041cbc103a5142fa2f2afad4\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`teacher_bookings\` ADD CONSTRAINT \`FK_2f1bf70d194a67a23785c0c2aab\` FOREIGN KEY (\`teacherId\`) REFERENCES \`teachers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`teacher_bookings\` ADD CONSTRAINT \`FK_01a8c0e0ea7886576f79c4ba050\` FOREIGN KEY (\`studentId\`) REFERENCES \`students\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`teacher_bookings\` ADD CONSTRAINT \`FK_98dc8997e99070f690c49ed8b18\` FOREIGN KEY (\`teacherSubjectId\`) REFERENCES \`teacher_subjects\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`teacher_bookings\` ADD CONSTRAINT \`FK_6e59b08c084db11bbe1a00db95a\` FOREIGN KEY (\`availabilityId\`) REFERENCES \`availablility\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`students\` ADD CONSTRAINT \`FK_e0208b4f964e609959aff431bf9\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`students\` ADD CONSTRAINT \`FK_6fea943b3b432a9e3e38d53c31b\` FOREIGN KEY (\`parentId\`) REFERENCES \`parents\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_a8687924ae4d52f05db87f3352f\` FOREIGN KEY (\`detailsId\`) REFERENCES \`user_details\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`academy_teachers\` ADD CONSTRAINT \`FK_fe4791f97f122e4e62d9d242851\` FOREIGN KEY (\`academyId\`) REFERENCES \`academies\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`academy_teachers\` ADD CONSTRAINT \`FK_e29327fcd2f739b78b9d14e4756\` FOREIGN KEY (\`teacherId\`) REFERENCES \`teachers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`academy_teachers\` DROP FOREIGN KEY \`FK_e29327fcd2f739b78b9d14e4756\``);
        await queryRunner.query(`ALTER TABLE \`academy_teachers\` DROP FOREIGN KEY \`FK_fe4791f97f122e4e62d9d242851\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_a8687924ae4d52f05db87f3352f\``);
        await queryRunner.query(`ALTER TABLE \`students\` DROP FOREIGN KEY \`FK_6fea943b3b432a9e3e38d53c31b\``);
        await queryRunner.query(`ALTER TABLE \`students\` DROP FOREIGN KEY \`FK_e0208b4f964e609959aff431bf9\``);
        await queryRunner.query(`ALTER TABLE \`teacher_bookings\` DROP FOREIGN KEY \`FK_6e59b08c084db11bbe1a00db95a\``);
        await queryRunner.query(`ALTER TABLE \`teacher_bookings\` DROP FOREIGN KEY \`FK_98dc8997e99070f690c49ed8b18\``);
        await queryRunner.query(`ALTER TABLE \`teacher_bookings\` DROP FOREIGN KEY \`FK_01a8c0e0ea7886576f79c4ba050\``);
        await queryRunner.query(`ALTER TABLE \`teacher_bookings\` DROP FOREIGN KEY \`FK_2f1bf70d194a67a23785c0c2aab\``);
        await queryRunner.query(`ALTER TABLE \`teachers\` DROP FOREIGN KEY \`FK_4d8041cbc103a5142fa2f2afad4\``);
        await queryRunner.query(`ALTER TABLE \`availablility\` DROP FOREIGN KEY \`FK_01df5869404d4291184c6141b3f\``);
        await queryRunner.query(`ALTER TABLE \`teacher_subjects\` DROP FOREIGN KEY \`FK_8b5bb4420cea1e9e5a988ec3e11\``);
        await queryRunner.query(`ALTER TABLE \`teacher_subjects\` DROP FOREIGN KEY \`FK_2013034e3c170743cbd5fda6de9\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP FOREIGN KEY \`FK_6df8dacbeed6e130c7032bf6f74\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP FOREIGN KEY \`FK_4b7ac7a7eb91f3e04229c7c0b6f\``);
        await queryRunner.query(`ALTER TABLE \`class_bookings\` DROP FOREIGN KEY \`FK_ee611bcc77ea9cbb2a3d747d22b\``);
        await queryRunner.query(`ALTER TABLE \`class_bookings\` DROP FOREIGN KEY \`FK_31c0bf5d0bae94266f2bd3f99f6\``);
        await queryRunner.query(`ALTER TABLE \`student_class_attendances\` DROP FOREIGN KEY \`FK_b496adeb96beabeec413ac61baa\``);
        await queryRunner.query(`ALTER TABLE \`student_class_attendances\` DROP FOREIGN KEY \`FK_51826f0fb7f602dc471b95978d0\``);
        await queryRunner.query(`ALTER TABLE \`parents\` DROP FOREIGN KEY \`FK_f1e08daeefd9c2e5def5746be7e\``);
        await queryRunner.query(`ALTER TABLE \`parent_children\` DROP FOREIGN KEY \`FK_e3bbd2e9386b2f512e61625d62f\``);
        await queryRunner.query(`ALTER TABLE \`parent_children\` DROP FOREIGN KEY \`FK_ef3f10e877846e162781086e846\``);
        await queryRunner.query(`ALTER TABLE \`user_education\` DROP FOREIGN KEY \`FK_98f09242a36729ef251819d19a4\``);
        await queryRunner.query(`ALTER TABLE \`academies\` DROP FOREIGN KEY \`FK_482f13c107afb2a671e2bc46fd2\``);
        await queryRunner.query(`ALTER TABLE \`user_details\` DROP FOREIGN KEY \`FK_5261d2468b1288b347d58e8b540\``);
        await queryRunner.query(`DROP INDEX \`IDX_65d5b7a199f6f2f30aec4310a3\` ON \`academy_teachers\``);
        await queryRunner.query(`DROP TABLE \`academy_teachers\``);
        await queryRunner.query(`DROP TABLE \`courses\``);
        await queryRunner.query(`DROP INDEX \`REL_a8687924ae4d52f05db87f3352\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP INDEX \`REL_e0208b4f964e609959aff431bf\` ON \`students\``);
        await queryRunner.query(`DROP TABLE \`students\``);
        await queryRunner.query(`DROP TABLE \`teacher_bookings\``);
        await queryRunner.query(`DROP INDEX \`REL_4d8041cbc103a5142fa2f2afad\` ON \`teachers\``);
        await queryRunner.query(`DROP TABLE \`teachers\``);
        await queryRunner.query(`DROP TABLE \`availablility\``);
        await queryRunner.query(`DROP INDEX \`IDX_8e762322ca7fbbe06ab8eb1ea6\` ON \`teacher_subjects\``);
        await queryRunner.query(`DROP TABLE \`teacher_subjects\``);
        await queryRunner.query(`DROP TABLE \`subjects\``);
        await queryRunner.query(`DROP TABLE \`classes\``);
        await queryRunner.query(`DROP TABLE \`class_bookings\``);
        await queryRunner.query(`DROP TABLE \`student_class_attendances\``);
        await queryRunner.query(`DROP INDEX \`REL_f1e08daeefd9c2e5def5746be7\` ON \`parents\``);
        await queryRunner.query(`DROP TABLE \`parents\``);
        await queryRunner.query(`DROP INDEX \`IDX_97b52ebf6575c48adab29cb650\` ON \`parent_children\``);
        await queryRunner.query(`DROP TABLE \`parent_children\``);
        await queryRunner.query(`DROP TABLE \`user_education\``);
        await queryRunner.query(`DROP TABLE \`academies\``);
        await queryRunner.query(`DROP INDEX \`REL_5261d2468b1288b347d58e8b54\` ON \`user_details\``);
        await queryRunner.query(`DROP TABLE \`user_details\``);
    }

}
