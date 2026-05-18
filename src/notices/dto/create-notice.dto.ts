import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import {
  DEFAULT_NOTICE_CATEGORY,
  DEFAULT_NOTICE_STATUS,
  NOTICE_CATEGORY_VALUES,
  NOTICE_STATUS_VALUES,
  type NoticeCategory,
  type NoticeStatus,
} from '../notices.constants.js';

export class CreateNoticeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  title!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: '내용을 입력해주세요.' })
  content!: string;

  @ApiProperty({
    required: false,
    enum: NOTICE_CATEGORY_VALUES,
    default: DEFAULT_NOTICE_CATEGORY,
    description: '공지사항 카테고리(뱃지 값)',
  })
  @IsOptional()
  @IsIn([...NOTICE_CATEGORY_VALUES])
  category?: NoticeCategory;

  @ApiProperty({
    required: false,
    enum: NOTICE_STATUS_VALUES,
    default: DEFAULT_NOTICE_STATUS,
    description: '공지사항 노출 상태',
  })
  @IsOptional()
  @IsIn([...NOTICE_STATUS_VALUES])
  status?: NoticeStatus;
}
