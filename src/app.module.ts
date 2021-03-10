/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GraphQLModule } from '@nestjs/graphql';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdeaModule } from './idea/idea.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpErrorFilter } from './shared/http-filter.error';
import { LoggingInterceptor } from './shared/logging.interceptor';
import { UserModule } from './user/user.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [TypeOrmModule.forRoot(),
    GraphQLModule.forRoot({
      typePaths: ['./**/*.graphql'],
      context: ({ req }) => ({ headers: req.headers }),
    }), IdeaModule, UserModule, CommentsModule],
  controllers: [AppController],
  providers: [AppService,{
    provide:APP_FILTER,
    useClass:HttpErrorFilter
  },
  {
  provide:APP_INTERCEPTOR,
  useClass:LoggingInterceptor
}],
})
export class AppModule {}
