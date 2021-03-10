/* eslint-disable prettier/prettier */
import { Resolver, Args, Query, Mutation, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { CommentsService } from './comments.service';
import { AuthGuard } from '../shared/auth.guard';

@Resolver('Comment')
export class CommentResolver {
  constructor(private commentService: CommentsService) {}

  @Query()
  async comment(@Args('id') id: string) {
    return await this.commentService.show(id);
  }

  @Mutation()
  @UseGuards(new AuthGuard())
  async createComment(
    @Args('idea') ideaId: string,
    @Args('comment') comment: string,
    @Context('user') user,
  ) {
    const { id: userId } = user;
    const data = { comment };
    console.log(ideaId, userId, data);
    return await this.commentService.create(ideaId, userId, data);
  }

  @Mutation()
  @UseGuards(new AuthGuard())
  async deleteComment(@Args('id') id: string, @Context('user') user) {
    const { id: userId } = user;
    return await this.commentService.destroy(id, userId);
  }
}
