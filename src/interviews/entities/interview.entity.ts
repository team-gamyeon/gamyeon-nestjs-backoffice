import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity.js';

export type InterviewStatus =
  | 'READY'
  | 'CREATED'
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'FINISHED';

@Entity('intvs')
export class InterviewEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: number;

  @Column({ type: 'varchar', nullable: true })
  title!: string | null;

  @Column({
    type: 'varchar',
    enum: ['READY', 'CREATED', 'IN_PROGRESS', 'PAUSED', 'FINISHED'],
  })
  status!: InterviewStatus;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt!: Date | null;

  @Column({ name: 'finished_at', type: 'timestamp', nullable: true })
  finishedAt!: Date | null;

  @Column({ name: 'paused_at', type: 'timestamp', nullable: true })
  pausedAt!: Date | null;

  @Column({ name: 'duration_seconds', type: 'bigint', nullable: true })
  durationSeconds!: number | null;

  @Column({ name: 'total_paused_seconds', type: 'bigint', default: 0 })
  totalPausedSeconds!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;
}
