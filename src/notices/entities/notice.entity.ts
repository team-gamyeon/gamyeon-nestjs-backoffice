import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { NoticeImageEntity } from './notice-image.entity.js';
import {
  DEFAULT_NOTICE_CATEGORY,
  DEFAULT_NOTICE_STATUS,
  type NoticeCategory,
  type NoticeStatus,
} from '../notices.constants.js';

@Entity('notices')
export class NoticeEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({
    type: 'varchar',
    length: 30,
    default: DEFAULT_NOTICE_CATEGORY,
  })
  category!: NoticeCategory;

  @Column({
    type: 'varchar',
    length: 20,
    default: DEFAULT_NOTICE_STATUS,
  })
  status!: NoticeStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @OneToMany(() => NoticeImageEntity, (img) => img.notice, {
    cascade: true,
    eager: true,
  })
  images!: NoticeImageEntity[];
}
