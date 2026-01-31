import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('webhooks')
export class Webhook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 256 })
  source: string;

  @Column({ type: 'varchar', length: 256 })
  event: string;

  @Column({ type: 'varchar' })
  payload: any;

  @CreateDateColumn()
  receivedAt: Date;
}
