import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateContributionMeal1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add any new columns or modify existing ones
    // Example: await queryRunner.query(`ALTER TABLE "contribution_meals" ADD COLUMN "new_field" VARCHAR`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert changes
    // Example: await queryRunner.query(`ALTER TABLE "contribution_meals" DROP COLUMN "new_field"`);
  }
}
