import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('token')
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

@Column({ type: 'varchar', length: 255 })
  code: string;

  @Column({ type: 'timestamp', default: () => "NOW() + INTERVAL '1 day'" })
  expired_date: Date;

  @Column({ type: 'uuid' })
  user_Id: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_Id' })
  user: User;
}
