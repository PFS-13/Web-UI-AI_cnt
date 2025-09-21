import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('message')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  conversation_id: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
  created_at: Date;

  @Column({ type: 'boolean', nullable: true })
  is_attach_file: boolean;

  @Column({ type: 'boolean', nullable: true })
  is_from_sender: boolean;

  @Column({ type: 'int', nullable: true })
  edited_from: number;

  @Column({ type: 'int', nullable: true })
  reply_from: number;
}
