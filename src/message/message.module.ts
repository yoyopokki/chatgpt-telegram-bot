import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageRepository } from './message.repository';

@Module({
  providers: [MessageRepository, MessageService],
  exports: [MessageService],
})
export class MessageModule {}
