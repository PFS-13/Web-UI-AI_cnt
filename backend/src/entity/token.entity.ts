import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';


export enum TokenType {
  AUTH = 'auth',
  FORGOT_PASSWORD = 'forgot_password',
}

@Entity('token')
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

@Column({ type: 'varchar', length: 255 })
  code: string;

  @Column({ type: 'timestamp', default: () => "NOW() + INTERVAL '1 day'" })
  expired_date: Date;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column()
  token_type : TokenType

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
