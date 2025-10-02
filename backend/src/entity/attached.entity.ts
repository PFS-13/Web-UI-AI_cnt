// src/entity/attached-message.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('attached_message')
export class AttachedMessage {
  @PrimaryGeneratedColumn()
  id: number;

  // Nama file di server (mis: 1696343456-uuid.png)
  @Column({ name: 'filename' })
  filename: string;

  // FK ke message (tetap number)
  @Column()
  message_id: number;

  // ekstensi file tanpa titik, mis: "png", "pdf"
  @Column({ nullable: true })
  extension: string;
}
