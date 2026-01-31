import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 256, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 256 })
  password: string;
}
