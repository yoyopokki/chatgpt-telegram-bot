import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { MessageModule } from '../message';

@Module({
  imports: [MessageModule],
  providers: [OpenaiService],
  exports: [OpenaiService],
})
export class OpenaiModule {}
