import { Injectable } from '@nestjs/common';
import { seedData } from 'database/seeds/seed-data';
import { DataSource } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(private readonly connection: DataSource) {}

  async seed(): Promise<void> {
    // Check if already seeded by checking if any users exist
    const userCount = await this.connection.query('SELECT COUNT(*) as count FROM users');
    const count = parseInt(userCount[0].count);

    if (count > 0) {
      console.log('⏭️  Database already seeded, skipping...');
      return;
    }

    console.log('🌱 Seeding database...');
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      await seedData(manager);
      await queryRunner.commitTransaction();
      console.log('✅ Database seeded successfully');
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
