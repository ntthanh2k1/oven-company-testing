import * as argon2 from 'argon2';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDb1769842096151 implements MigrationInterface {
  name = 'UpdateDb1769842096151';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying(256) NOT NULL, "password" character varying(256) NOT NULL, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "webhooks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "source" character varying(256) NOT NULL, "event" character varying(256) NOT NULL, "payload" jsonb NOT NULL, "receivedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9e8795cfc899ab7bdaa831e8527" PRIMARY KEY ("id"))`,
    );

    // seeding 1 user mẫu
    const password = await argon2.hash('admin@123');

    await queryRunner.query(
      `
      INSERT INTO users (id, username, password)
      VALUES (uuid_generate_v4(), 'admin', $1)
      ON CONFLICT (username) DO NOTHING
      `,
      [password],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "webhooks"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
