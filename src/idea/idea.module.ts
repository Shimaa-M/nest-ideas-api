/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from 'src/comments/comment.entity';
import { CommentsService } from 'src/comments/comments.service';
import { UserEntity } from 'src/user/user.entity';
import { IdeaController } from './idea.controller';
import { IdeaEntity } from './idea.entity';
import { IdeaResolver } from './idea.resolver';
import { IdeaService } from './idea.service';

@Module({
  imports: [TypeOrmModule.forFeature([IdeaEntity,UserEntity,CommentEntity])],
  controllers: [IdeaController],
  providers: [IdeaService,IdeaResolver,CommentsService]
})
export class IdeaModule {}
