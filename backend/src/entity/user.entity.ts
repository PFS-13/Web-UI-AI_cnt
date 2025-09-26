import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AuthProvider {
  MANUAL = 'manual',
  GOOGLE = 'google',
  BOTH = 'both',
}
import { UUID } from 'crypto';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  image_url: string;

  @Column({ default: false })
  is_active: boolean;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.MANUAL,
  })
  provider: AuthProvider;



}
