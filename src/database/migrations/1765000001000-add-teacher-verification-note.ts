import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddTeacherVerificationNote1765000001000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('teachers', new TableColumn({
            name: 'verificationNote',
            type: 'varchar',
            length: '255',
            isNullable: true,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('teachers', 'verificationNote');
    }
}

