/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from 'src/comments/comment.entity';
import { CommentsService } from 'src/comments/comments.service';
import { IdeaEntity } from 'src/idea/idea.entity';
import { UserController } from './user.controller';
import { UserEntity } from './user.entity';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, IdeaEntity, CommentEntity])],
  controllers: [UserController],
  providers: [UserService,UserResolver,CommentsService]
})
export class UserModule {}
