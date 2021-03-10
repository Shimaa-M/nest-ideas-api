/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Votes } from 'src/shared/votes.enum';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { IdeaDTO, IdeaRO } from './idea.dto';
import { IdeaEntity } from './idea.entity';

@Injectable()
export class IdeaService {
    constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>){}

    private ideaToResponseObject(idea: IdeaEntity): IdeaRO {
        const responseObject: any = {
          ...idea,
          author: idea.author ? idea.author.toResponseObject(false) : null,
        };
        if (idea.upvotes) {
            responseObject.upvotes = idea.upvotes.length;
          }
          if (idea.downvotes) {
            responseObject.downvotes = idea.downvotes.length;
          }
        return responseObject;
    }

    private ensureOwnership(idea: IdeaEntity, userId: string) {
        if (idea.author.id !== userId) {
          throw new HttpException('Incorrect User', HttpStatus.UNAUTHORIZED);
        }
      }

      private async vote(idea: IdeaEntity, user: UserEntity, vote: Votes) {
        const opposite = vote === Votes.UP ? Votes.DOWN : Votes.UP;
        if (
          idea[opposite].filter(voter => voter.id === user.id).length > 0 ||
          idea[vote].filter(voter => voter.id === user.id).length > 0
        ) {
          idea[opposite] = idea[opposite].filter(voter => voter.id !== user.id);
          idea[vote] = idea[vote].filter(voter => voter.id !== user.id);
          await this.ideaRepository.save(idea);
        } else if (idea[vote].filter(voter => voter.id === user.id).length < 1) {
          idea[vote].push(user);
          await this.ideaRepository.save(idea);
        } else {
          throw new HttpException('Unable to cast vote', HttpStatus.BAD_REQUEST);
        }
    
        return idea;
      } 

      async showAll(page = 1, newest?: boolean): Promise<IdeaRO[]> {
        const ideas = await this.ideaRepository.find({
          relations: ['author', 'upvotes', 'downvotes', 'comments'],
          take: 25,
          skip: 25 * (page - 1),
          order: newest && { created: 'DESC' },
        });
        return ideas.map(idea => this.ideaToResponseObject(idea));
      }

    async create(userId: UserEntity,data:IdeaDTO): Promise<IdeaRO> {
    const user = await this.userRepository.findOne({ where: { id: userId.id } });
    const idea = await this.ideaRepository.create({ ...data, author: user });
    await this.ideaRepository.save(idea);
    return this.ideaToResponseObject(idea);
    }

    async read(id:string): Promise<IdeaRO> {
    const idea= await this.ideaRepository.findOne({where : {id}});
    if (!idea) {
        throw new HttpException('Not found', HttpStatus.NOT_FOUND);
      }
      return this.ideaToResponseObject(idea);
    }

    async update(id:string, userId: UserEntity, data:Partial<IdeaDTO>): Promise<IdeaRO> {
    let idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author'],})
    if (!idea) {
        throw new HttpException('Not found', HttpStatus.NOT_FOUND);
      }
      this.ensureOwnership(idea, userId.id);
      await this.ideaRepository.update({ id }, data);
      idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author'],
    });
     
      return this.ideaToResponseObject(idea);
    }

    async destroy(id:string, userId: string): Promise<IdeaRO> {
    const idea = await this.ideaRepository.findOne({
        where: { id }, relations: ['author'],
      });
    
    if (!idea) {
    throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
   // this.ensureOwnership(idea, userId);
   await this.ideaRepository.delete({id});
   return this.ideaToResponseObject(idea);
    }

    async upvote(id: string, userId: UserEntity) {
        let idea = await this.ideaRepository.findOne({
          where: { id },
          relations: ['author', 'upvotes', 'downvotes'],
        });
        const user = await this.userRepository.findOne({ where: { id: userId.id } });
        idea = await this.vote(idea, user, Votes.UP);
    
        return this.ideaToResponseObject(idea);
      }
    
      async downvote(id: string, userId: UserEntity) {
        let idea = await this.ideaRepository.findOne({
          where: { id },
          relations: ['author', 'upvotes', 'downvotes'],
        });
        const user = await this.userRepository.findOne({ where: { id: userId.id } });
        idea = await this.vote(idea, user, Votes.DOWN);
   
        return this.ideaToResponseObject(idea);
      }

    async bookmark(id: string, userId: UserEntity) {
        const idea = await this.ideaRepository.findOne({ where: { id } });
        const user = await this.userRepository.findOne({
          where: { id: userId.id },
          relations: ['bookmarks'],
        });
    
        if (user.bookmarks.filter(bookmark => bookmark.id === idea.id).length < 1) {
          user.bookmarks.push(idea);
          await this.userRepository.save(user);
        } else {
          throw new HttpException(
            'Idea already bookmarked ',
            HttpStatus.BAD_REQUEST,
          );
        }
    
        return user.toResponseObject(false);
      }
    
      async unbookmark(id: string, userId: UserEntity) {
        const idea = await this.ideaRepository.findOne({ where: { id } });
        const user = await this.userRepository.findOne({
          where: { id: userId.id },
          relations: ['bookmarks'],
        });
    
        if (user.bookmarks.filter(bookmark => bookmark.id === idea.id).length > 0) {
          user.bookmarks = user.bookmarks.filter(
            bookmark => bookmark.id !== idea.id,
          );
          await this.userRepository.save(user);
        } else {
          throw new HttpException('Cannot remove bookmark', HttpStatus.BAD_REQUEST);
        }
    
        return user.toResponseObject(false);
      }
}
