import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('knowledge')
export class KnowledgeController {
  constructor(private knowledgeService: KnowledgeService) {}

  @Public()
  @Get('categories')
  async categories() {
    return this.knowledgeService.getCategories();
  }

  @Public()
  @Get('search')
  async search(@Query('keyword') keyword: string, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.knowledgeService.searchArticles(keyword, page, limit);
  }
}
