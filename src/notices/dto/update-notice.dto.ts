import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';
import {
  NOTICE_CATEGORY_VALUES,
  NOTICE_STATUS_VALUES,
  type NoticeCategory,
  type NoticeStatus,
} from '../notices.constants.js';

export class UpdateNoticeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    enum: NOTICE_CATEGORY_VALUES,
    description: '공지사항 카테고리(뱃지 값)',
  })
  @IsOptional()
  @IsIn([...NOTICE_CATEGORY_VALUES])
  category?: NoticeCategory;

  @ApiPropertyOptional({
    enum: NOTICE_STATUS_VALUES,
    description: '공지사항 노출 상태',
  })
  @IsOptional()
  @IsIn([...NOTICE_STATUS_VALUES])
  status?: NoticeStatus;
}
