import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';

export class DatabaseHelper {
  private dataSource: DataSource;

  constructor(app: INestApplication) {
    this.dataSource = app.get(DataSource);
  }

  /**
   * Clean all test data except users and roles
   * This preserves authentication data while cleaning all other test data
   */
  async cleanDatabase(): Promise<void> {
    try {
      // Delete from tables in order to respect foreign key constraints
      await this.dataSource.query(`DELETE FROM chat_messages;`);
      await this.dataSource.query(`DELETE FROM chat_participants;`);
      await this.dataSource.query(`DELETE FROM chat_sessions;`);
      await this.dataSource.query(`DELETE FROM comments;`);
      await this.dataSource.query(`DELETE FROM likes;`);
      await this.dataSource.query(`DELETE FROM posts;`);
      await this.dataSource.query(`DELETE FROM notifications;`);
      await this.dataSource.query(`DELETE FROM activity_records;`);
      await this.dataSource.query(`DELETE FROM challenges_users;`);
      await this.dataSource.query(`DELETE FROM medals_users;`);
      await this.dataSource.query(`DELETE FROM daily_meals;`);
      await this.dataSource.query(`DELETE FROM daily_ingres;`);
      await this.dataSource.query(`DELETE FROM daily_logs;`);
      await this.dataSource.query(`DELETE FROM fitness_goals;`);
      await this.dataSource.query(`DELETE FROM fitness_profiles;`);
      await this.dataSource.query(`DELETE FROM fav_meals;`);
      await this.dataSource.query(`DELETE FROM fav_ingres;`);
      await this.dataSource.query(`DELETE FROM contribution_meals;`);
      await this.dataSource.query(`DELETE FROM contribution_ingres;`);
      await this.dataSource.query(`DELETE FROM ingre_meals;`);
      await this.dataSource.query(
        `DELETE FROM meals WHERE id NOT IN (SELECT id FROM meals LIMIT 0);`,
      );
      await this.dataSource.query(
        `DELETE FROM ingredients WHERE id NOT IN (SELECT id FROM ingredients LIMIT 0);`,
      );
      await this.dataSource.query(
        `DELETE FROM challenges WHERE id NOT IN (SELECT id FROM challenges LIMIT 0);`,
      );
      await this.dataSource.query(
        `DELETE FROM medals WHERE id NOT IN (SELECT id FROM medals LIMIT 0);`,
      );
      await this.dataSource.query(`DELETE FROM devices;`);
      await this.dataSource.query(
        `DELETE FROM activities WHERE id NOT IN (SELECT id FROM activities LIMIT 0);`,
      );
      await this.dataSource.query(`DELETE FROM fitness_sync_events;`);
      await this.dataSource.query(`DELETE FROM token_transactions;`);
      await this.dataSource.query(`DELETE FROM video_calls;`);
      await this.dataSource.query(`DELETE FROM bookings;`);
      await this.dataSource.query(`DELETE FROM consultations;`);
      await this.dataSource.query(`DELETE FROM wallets;`);
      await this.dataSource.query(`DELETE FROM experts;`);
      await this.dataSource.query(`DELETE FROM expert_roles;`);

      console.log('Database cleaned successfully (preserved users and roles)');
    } catch (error) {
      console.log('Database cleanup failed:', error.message);
    }
  }

  /**
   * Ensure test user exists in database
   * Call this in beforeAll of each test suite
   * Silently ignores all errors since users should already exist
   */
  async ensureTestUser(): Promise<void> {
    try {
      // Insert role if not exists
      await this.dataSource.query(`
        INSERT INTO roles (id, name, created_at) 
        VALUES ('8f7924ae-eb80-4663-aced-05323c046f61', 'user', NOW()) 
        ON CONFLICT (id) DO NOTHING;
      `);
    } catch (error) {
      // Ignore - role already exists
    }

    try {
      await this.dataSource.query(`
        INSERT INTO roles (id, name, created_at) 
        VALUES ('4b9a9b5d-8d86-4f4b-9f36-5c9b4a4db123', 'admin', NOW()) 
        ON CONFLICT (id) DO NOTHING;
      `);
    } catch (error) {
      // Ignore - role already exists
    }

    try {
      // Insert test user — look up role by name to avoid hardcoded ID mismatch
      await this.dataSource.query(`
        INSERT INTO users (id, username, email, fullname, gender, birth_date, role_id, "isVerified", created_at)
        VALUES (
          '4d46d27a-c9e3-465d-8e4e-a5171905da39',
          'hankhongg',
          'hankhongg@gmail.com',
          'Khong Han',
          false,
          '2005-06-10',
          (SELECT id FROM roles WHERE name = 'user' LIMIT 1),
          true,
          NOW()
        ) ON CONFLICT (id) DO NOTHING;
      `);
    } catch (error) {
      // Ignore all errors - user already exists
    }

    try {
      // Insert admin user — look up role by name to avoid hardcoded ID mismatch
      await this.dataSource.query(`
        INSERT INTO users (id, username, email, fullname, gender, birth_date, role_id, "isVerified", created_at)
        VALUES (
          'e55c00cd-2b9c-4627-96c4-7988791e0cf2',
          'admin',
          'khonghuynhngochan@gmail.com',
          'HealthPal Admin',
          true,
          '1990-01-01',
          (SELECT id FROM roles WHERE name = 'admin' LIMIT 1),
          true,
          NOW()
        ) ON CONFLICT (id) DO NOTHING;
      `);
    } catch (error) {
      // Ignore all errors - user already exists
    }
  }

  /**
   * Seed essential data (diet types, etc.)
   */
  async seedEssentialData(): Promise<{ dietTypeId: string }> {
    // Create a diet type for testing (note: entity only has name and percentage fields, not description)
    const dietTypeResult = await this.dataSource.query(
      `INSERT INTO diet_types (id, name, protein_percentages, fat_percentages, carbs_percentages) 
       VALUES (gen_random_uuid(), 'Test Diet', 30, 30, 40) 
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
    );

    return {
      dietTypeId: dietTypeResult[0].id,
    };
  }

  /**
   * Seed a verified expert tied to the admin user.
   * Returns the expert's UUID so tests can reference it.
   */
  async seedTestExpert(): Promise<{ expertId: string; expertRoleId: string }> {
    const roleResult = await this.dataSource.query(`
      INSERT INTO expert_roles (id, name, created_at)
      VALUES (gen_random_uuid(), 'General Health', NOW())
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `);
    const expertRoleId: string = roleResult[0].id;

    const adminUserId = 'e55c00cd-2b9c-4627-96c4-7988791e0cf2';
    const expertResult = await this.dataSource.query(
      `
      INSERT INTO experts (id, bio, token_per_minute, is_verified, rating_avg, rating_count, expert_role_id, user_id, created_at)
      VALUES (gen_random_uuid(), 'Test expert bio', 5, true, 4.5, 10, $1, $2, NOW())
      ON CONFLICT (user_id) DO UPDATE SET is_verified = true
      RETURNING id
    `,
      [expertRoleId, adminUserId],
    );

    return { expertId: expertResult[0].id, expertRoleId };
  }

  /**
   * Get database connection
   */
  getDataSource(): DataSource {
    return this.dataSource;
  }
}
