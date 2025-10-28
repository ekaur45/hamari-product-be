import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleToUser1761565355712 implements MigrationInterface {
  name = 'AddRoleToUser1761565355712';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_f0b221b2021ef01fcf2fe2cee2\` ON \`userdetails\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`role\` varchar(255) NOT NULL DEFAULT 'Other'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`role\``);
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_f0b221b2021ef01fcf2fe2cee2\` ON \`userdetails\` (\`userId\`)`,
    );
  }
}
