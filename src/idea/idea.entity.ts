/* eslint-disable prettier/prettier */
import { CommentEntity } from 'src/comments/comment.entity';
import { UserEntity } from 'src/user/user.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    Column,
    UpdateDateColumn,
    ManyToOne,
    ManyToMany,
    JoinTable,
    OneToMany,
  } from 'typeorm';

@Entity('idea')
export class IdeaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column('text')
  idea: string;

  @Column('text')
  description: string;

  @ManyToOne(type=> UserEntity, user=>user.ideas)
  author : UserEntity

  @ManyToMany(type => UserEntity, { cascade: true })
  @JoinTable()
  upvotes: UserEntity[];

  @ManyToMany(type => UserEntity, { cascade: true })
  @JoinTable()
  downvotes: UserEntity[];

  @OneToMany(type=> CommentEntity,Comment=>Comment.idea,{cascade:true})
  comments: CommentEntity[]
}