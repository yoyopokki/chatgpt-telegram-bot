import { Injectable, Logger } from '@nestjs/common';
import {
  ChatCompletionRequestMessage,
  Configuration,
  OpenAIApiFactory,
} from 'openai';
import * as process from 'process';
import { Message, MessageService } from '../message';
import { User } from '../user';

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

  private async getChatCompletions(
    chatGptRequestMessages: ChatCompletionRequestMessage[],
  ) {
    return this.openaiApi.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: chatGptRequestMessages,
    });
  }

  async completePrompt(
    user: User,
    chatId: string,
    prompt: string,
  ): Promise<string> {
    await this.saveUserMessage(user, chatId, prompt);

    const messages = await this.messageService.findMessagesByUser(chatId);
    const chatGptRequestMessages = this.createChatGptRequestMessages(
      messages,
      prompt,
    );

    const completions = await this.getChatCompletions(chatGptRequestMessages);
    const aiMessageContent = completions.data.choices[0].message.content.trim();
    await this.saveAiMessage(user, chatId, aiMessageContent);

    return aiMessageContent;
  }

  private createChatGptRequestMessages(
    messages: Message[],
    prompt: string,
  ): ChatCompletionRequestMessage[] {
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

    return chatGptRequestMessages;
  }

  private async saveAiMessage(
    user: User,
    chatId: string,
    content: string,
  ): Promise<Message> {
    const aiMessage = new Message();
    aiMessage.chatId = chatId;
    aiMessage.content = content;
    aiMessage.user = user;
    aiMessage.role = 'assistant';

    return this.messageService.createMessage(aiMessage);
  }

  private async saveUserMessage(
    user: User,
    chatId: string,
    content: string,
  ): Promise<Message> {
    const userMessage = new Message();
    userMessage.chatId = chatId;
    userMessage.content = content;
    userMessage.user = user;
    userMessage.role = 'user';

    return this.messageService.createMessage(userMessage);
  }
}
