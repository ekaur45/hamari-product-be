import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsernameToUserTable1761559151368 implements MigrationInterface {
  name = 'AddUsernameToUserTable1761559151368';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`username\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`userdetails\` ADD UNIQUE INDEX \`IDX_f0b221b2021ef01fcf2fe2cee2\` (\`userId\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`REL_f0b221b2021ef01fcf2fe2cee2\` ON \`userdetails\` (\`userId\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`userdetails\` ADD CONSTRAINT \`FK_f0b221b2021ef01fcf2fe2cee22\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`userdetails\` DROP FOREIGN KEY \`FK_f0b221b2021ef01fcf2fe2cee22\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_f0b221b2021ef01fcf2fe2cee2\` ON \`userdetails\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`userdetails\` DROP INDEX \`IDX_f0b221b2021ef01fcf2fe2cee2\``,
    );
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`username\``);
  }
}
