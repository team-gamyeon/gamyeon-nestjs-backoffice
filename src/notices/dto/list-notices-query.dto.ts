import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsIn } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import {
  NOTICE_CATEGORY_VALUES,
  NOTICE_STATUS_VALUES,
  type NoticeCategory,
  type NoticeStatus,
} from '../notices.constants.js';

export class ListNoticesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'ISO date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'ISO date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ enum: ['createdAt', 'updatedAt'], default: 'createdAt' })
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt'])
  sortBy: 'createdAt' | 'updatedAt' = 'createdAt';

  @ApiPropertyOptional({
    enum: NOTICE_CATEGORY_VALUES,
    description: '카테고리 필터',
  })
  @IsOptional()
  @IsIn([...NOTICE_CATEGORY_VALUES])
  category?: NoticeCategory;

  @ApiPropertyOptional({
    enum: NOTICE_STATUS_VALUES,
    description: '상태 필터',
  })
  @IsOptional()
  @IsIn([...NOTICE_STATUS_VALUES])
  status?: NoticeStatus;
}
