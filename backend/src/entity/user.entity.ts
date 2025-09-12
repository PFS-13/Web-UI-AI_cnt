// src/users/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';

export enum AuthProvider {
  MANUAL = 'manual',
  GOOGLE = 'google',
  BOTH = 'both',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ default: false })
  is_active: boolean;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.MANUAL,
  })
  provider: AuthProvider;

  @Column({ nullable: true })
  google_id: string;

}