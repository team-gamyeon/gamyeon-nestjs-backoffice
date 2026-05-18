import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { ListQuestionsQueryDto } from './dto/list-questions-query.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@ApiTags('면접 질문 관리')
@ApiBearerAuth()
@Controller('api/v1/questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  @ApiOperation({ summary: '질문 목록 조회' })
  listQuestions(@Query() query: ListQuestionsQueryDto) {
    return this.questionsService.listQuestions(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '질문 생성' })
  createQuestion(@Body() dto: CreateQuestionDto) {
    return this.questionsService.createQuestion(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '질문 수정' })
  updateQuestion(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateQuestionDto) {
    return this.questionsService.updateQuestion(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '질문 삭제 (소프트 삭제)' })
  deleteQuestion(@Param('id', ParseIntPipe) id: number) {
    return this.questionsService.deleteQuestion(id);
  }
}
