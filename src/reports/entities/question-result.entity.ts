import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ReportEntity } from './report.entity.js';

@Entity('question_results')
export class QuestionResultEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'question_id' })
  questionId!: string;

  @Column({ type: 'text' })
  question!: string;

  @Column({ type: 'text' })
  answer!: string;

  @Column({ type: 'float', nullable: true })
  score!: number | null;

  @Column({ type: 'text' })
  feedback!: string;

  @ManyToOne(() => ReportEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'report_id' })
  report!: ReportEntity;

  @Column({ name: 'report_id', type: 'bigint' })
  reportId!: number;
}
