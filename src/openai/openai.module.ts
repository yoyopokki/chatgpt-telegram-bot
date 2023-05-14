import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { MessageRepository } from '../message/message.repository';

@Module({
  providers: [OpenaiService, MessageRepository],
  exports: [OpenaiService],
})
export class OpenaiModule {}
