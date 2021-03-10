/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Logger, Param, Post, Query, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from 'src/shared/auth.guard';
import { CommentDTO } from './comment.dto';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
    logger = new Logger('CommentController');
    constructor(private commentService: CommentsService) {}
  
    @Get('idea/:id')
    showCommentsByIdea(@Param('id') idea: string, @Query('page') page: number
    ) {
      return this.commentService.showByIdea(idea,page);
    }
  
    @Post('idea/:id')
    @UseGuards(new AuthGuard())
    @UsePipes(new ValidationPipe())
    createComment(
      @Param('id') idea: string,
      @Req() request,
      @Body() data: CommentDTO,
    ) {
        const user = request.user.id
      return this.commentService.create(idea, user, data);
    }
  
    @Get('user/:id')
    showCommentsByUser(@Param('id') user: string , @Query('page') page: number
    ) {
      return this.commentService.showByUser(user,page);
    }
  
    @Get(':id')
    showComment(@Param('id') id: string) {
      return this.commentService.show(id);
    }
  
    @Delete(':id')
    @UseGuards(new AuthGuard())
    destroyComment(@Param('id') id: string, @Req() request) {
        const user = request.user.id
      return this.commentService.destroy(id, user);
    }
}
