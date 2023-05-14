import { Injectable } from '@nestjs/common';
import {
  ChatCompletionRequestMessage,
  Configuration,
  OpenAIApiFactory,
} from 'openai';
import * as process from 'process';
import { Message } from '../message';
import { User } from '../user/user.entity';
import { MessageService } from '../message';

@Injectable()
export class OpenaiService {
  private openaiApi: ReturnType<typeof OpenAIApiFactory>;

  constructor(private messageService: MessageService) {
    this.openaiApi = OpenAIApiFactory(
      new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      }),
    );
  }

  async completePrompt(
    user: User,
    chatId: string,
    prompt: string,
  ): Promise<string> {
    const userMessage = new Message();
    userMessage.chatId = chatId;
    userMessage.content = prompt;
    userMessage.user = user;
    userMessage.role = 'user';
    await this.messageService.createMessage(userMessage);

    const messages = await this.messageService.findMessagesByUser(chatId);

    let chatGptRequestMessages: ChatCompletionRequestMessage[] = [];
    if (messages.length) {
      chatGptRequestMessages = messages.map((message) => ({
        role: message.role,
        content: message.content,
      }));
    } else {
      chatGptRequestMessages = [
        {
          role: 'user',
          content: prompt,
        },
      ];
    }

    const completions = await this.openaiApi.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: chatGptRequestMessages,
    });

    const aiMessage = new Message();
    aiMessage.chatId = chatId;
    aiMessage.content = completions.data.choices[0].message.content.trim();
    aiMessage.user = user;
    aiMessage.role = 'assistant';
    await this.messageService.createMessage(aiMessage);

    return completions.data.choices[0].message.content.trim();
  }
}
