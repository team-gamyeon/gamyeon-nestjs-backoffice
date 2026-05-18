import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsIn } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export class ListInterviewsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ['ALL', 'READY', 'CREATED', 'IN_PROGRESS', 'PAUSED', 'FINISHED'],
  })
  @IsOptional()
  @IsIn(['ALL', 'READY', 'CREATED', 'IN_PROGRESS', 'PAUSED', 'FINISHED'])
  status?: string;

  @ApiPropertyOptional({ description: '검색어 (사용자 닉네임/이메일)' })
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

  @ApiPropertyOptional({
    enum: ['createdAt', 'startedAt', 'durationSeconds'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['createdAt', 'startedAt', 'durationSeconds'])
  sortBy: 'createdAt' | 'startedAt' | 'durationSeconds' = 'createdAt';
}
