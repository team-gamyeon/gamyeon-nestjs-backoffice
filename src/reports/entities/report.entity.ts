import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity.js';

export type ReportDbStatus = 'IN_PROGRESS' | 'SUCCEED' | 'FAILED';

@Entity('reports')
export class ReportEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'intv_id', type: 'bigint' })
  intvId!: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: number;

  @Column({ name: 'job_category', type: 'varchar', nullable: true })
  jobCategory!: string | null;

  @Column({ name: 'status', type: 'varchar' })
  status!: ReportDbStatus;

  @Column({ name: 'total_score', type: 'int', nullable: true })
  totalScore!: number | null;

  @Column({ name: 'report_data', type: 'jsonb', nullable: true })
  reportData!: Record<string, unknown> | null;

  @Column({ name: 'strengths', type: 'jsonb', nullable: true })
  strengths!: string[] | null;

  @Column({ name: 'weaknesses', type: 'jsonb', nullable: true })
  weaknesses!: string[] | null;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;
}
