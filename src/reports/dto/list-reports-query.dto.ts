import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export class ListReportsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['ALL', 'COMPLETED', 'IN_PROGRESS', 'FAILED'] })
  @IsOptional()
  @IsIn(['ALL', 'COMPLETED', 'IN_PROGRESS', 'FAILED'])
  status?: string;

  @ApiPropertyOptional({ description: '검색어 (리포트ID/사용자 닉네임)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ['completedAt', 'createdAt', 'score'],
    default: 'completedAt',
  })
  @IsOptional()
  @IsIn(['completedAt', 'createdAt', 'score'])
  sortBy: 'completedAt' | 'createdAt' | 'score' = 'completedAt';
}
