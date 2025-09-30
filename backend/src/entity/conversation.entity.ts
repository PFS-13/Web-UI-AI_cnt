import { UUID } from 'crypto';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  conversation_id: UUID;

  @Column({ type: 'varchar', length: 50 })
  title: string;

  @Column({ type: 'uuid' })
  user_id: UUID;

  @Column({ type: 'uuid',nullable: true })
  shared_url: string;

  @Column({ type: 'varchar',nullable: true })
  shared_path: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'now()' })
  last_updated: Date;
}
