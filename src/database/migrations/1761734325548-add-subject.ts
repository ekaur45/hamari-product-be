import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSubject1761734325548 implements MigrationInterface {
    name = 'AddSubject1761734325548'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`classes\` DROP FOREIGN KEY \`FK_4b7ac7a7eb91f3e04229c7c0b6f\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP FOREIGN KEY \`FK_7cc795906d5950759129273d926\``);
        await queryRunner.query(`CREATE TABLE \`subjects\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(150) NOT NULL, \`description\` text NULL, \`academyId\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`isDeleted\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`title\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`type\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`startTime\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`endTime\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`maxStudents\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`fee\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`location\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`meetingLink\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`teacherId\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`academyId\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`isDeleted\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`name\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`title\` varchar(200) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`type\` enum ('individual', 'academy') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`status\` enum ('scheduled', 'ongoing', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled'`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`startTime\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`endTime\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`maxStudents\` int NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`fee\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`location\` varchar(200) NULL`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`meetingLink\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`teacherId\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`academyId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`isDeleted\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`performances\` DROP FOREIGN KEY \`FK_e148baf580c789b716c532dbb1b\``);
        await queryRunner.query(`ALTER TABLE \`payments\` DROP FOREIGN KEY \`FK_36161da22680efd0b381bbf03d7\``);
        await queryRunner.query(`ALTER TABLE \`class_enrollments\` DROP FOREIGN KEY \`FK_521c435eb0bf92e3b1550154695\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`id\` int NOT NULL PRIMARY KEY AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`description\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`classes\` CHANGE \`createdAt\` \`createdAt\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`classes\` CHANGE \`updatedAt\` \`updatedAt\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`classes\` CHANGE \`id\` \`id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`id\` varchar(36) NOT NULL PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`subjects\` ADD CONSTRAINT \`FK_55206bc2e24975cfb774f29d6ed\` FOREIGN KEY (\`academyId\`) REFERENCES \`academies\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`performances\` ADD CONSTRAINT \`FK_e148baf580c789b716c532dbb1b\` FOREIGN KEY (\`classId\`) REFERENCES \`classes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payments\` ADD CONSTRAINT \`FK_36161da22680efd0b381bbf03d7\` FOREIGN KEY (\`classId\`) REFERENCES \`classes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD CONSTRAINT \`FK_4b7ac7a7eb91f3e04229c7c0b6f\` FOREIGN KEY (\`teacherId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD CONSTRAINT \`FK_7cc795906d5950759129273d926\` FOREIGN KEY (\`academyId\`) REFERENCES \`academies\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`class_enrollments\` ADD CONSTRAINT \`FK_521c435eb0bf92e3b1550154695\` FOREIGN KEY (\`classId\`) REFERENCES \`classes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`class_enrollments\` DROP FOREIGN KEY \`FK_521c435eb0bf92e3b1550154695\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP FOREIGN KEY \`FK_7cc795906d5950759129273d926\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP FOREIGN KEY \`FK_4b7ac7a7eb91f3e04229c7c0b6f\``);
        await queryRunner.query(`ALTER TABLE \`payments\` DROP FOREIGN KEY \`FK_36161da22680efd0b381bbf03d7\``);
        await queryRunner.query(`ALTER TABLE \`performances\` DROP FOREIGN KEY \`FK_e148baf580c789b716c532dbb1b\``);
        await queryRunner.query(`ALTER TABLE \`subjects\` DROP FOREIGN KEY \`FK_55206bc2e24975cfb774f29d6ed\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`description\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`id\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD PRIMARY KEY (\`id\`)`);
        await queryRunner.query(`ALTER TABLE \`classes\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`classes\` CHANGE \`updatedAt\` \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`classes\` CHANGE \`createdAt\` \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`id\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD PRIMARY KEY (\`id\`)`);
        await queryRunner.query(`ALTER TABLE \`class_enrollments\` ADD CONSTRAINT \`FK_521c435eb0bf92e3b1550154695\` FOREIGN KEY (\`classId\`) REFERENCES \`classes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payments\` ADD CONSTRAINT \`FK_36161da22680efd0b381bbf03d7\` FOREIGN KEY (\`classId\`) REFERENCES \`classes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`performances\` ADD CONSTRAINT \`FK_e148baf580c789b716c532dbb1b\` FOREIGN KEY (\`classId\`) REFERENCES \`classes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`isDeleted\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`academyId\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`teacherId\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`meetingLink\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`location\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`fee\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`maxStudents\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`endTime\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`startTime\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`type\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`title\``);
        await queryRunner.query(`ALTER TABLE \`classes\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`name\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`isDeleted\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`academyId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`teacherId\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`meetingLink\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`location\` varchar(200) NULL`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`fee\` decimal NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`maxStudents\` int NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`endTime\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`startTime\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`status\` enum ('scheduled', 'ongoing', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled'`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`type\` enum ('individual', 'academy') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD \`title\` varchar(200) NOT NULL`);
        await queryRunner.query(`DROP TABLE \`subjects\``);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD CONSTRAINT \`FK_7cc795906d5950759129273d926\` FOREIGN KEY (\`academyId\`) REFERENCES \`academies\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`classes\` ADD CONSTRAINT \`FK_4b7ac7a7eb91f3e04229c7c0b6f\` FOREIGN KEY (\`teacherId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
