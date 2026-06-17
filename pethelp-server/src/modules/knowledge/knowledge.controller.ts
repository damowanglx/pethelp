import { Controller, Get, Post, Query, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('knowledge')
export class KnowledgeController {
  constructor(private knowledgeService: KnowledgeService) {}

  @Public()
  @Get('categories')
  async categories() {
    return this.knowledgeService.getCategories();
  }

  @Public()
  @Get('articles')
  async articles(@Query('page') page = 1, @Query('limit') limit = 20, @Query('categoryId') categoryId?: number) {
    return this.knowledgeService.getArticles(page, limit, categoryId);
  }

  @Public()
  @Get('articles/hot')
  async hotArticles(@Query('limit') limit = 5) {
    return this.knowledgeService.getHotArticles(limit);
  }

  @Public()
  @Get('articles/:id')
  async getArticle(@Param('id', ParseIntPipe) id: number) {
    return this.knowledgeService.getArticle(id);
  }

  @Public()
  @Get('search')
  async search(@Query('keyword') keyword: string, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.knowledgeService.searchArticles(keyword, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Post('articles/:id/like')
  async toggleLike(@Param('id', ParseIntPipe) id: number) {
    return this.knowledgeService.toggleLike(id);
  }
}
