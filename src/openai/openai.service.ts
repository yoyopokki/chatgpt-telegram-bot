import { Injectable } from '@nestjs/common';
import { Configuration, OpenAIApiFactory } from 'openai';
import * as process from "process";

@Injectable()
export class OpenaiService {
    private openaiApi: ReturnType<typeof OpenAIApiFactory>;

    constructor() {
        this.openaiApi = OpenAIApiFactory(new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        }));
    }

    async completePrompt(prompt: string): Promise<string> {
        const completions = await this.openaiApi.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "user",
                content: prompt,
            }],
        });

        return completions.data.choices[0].message.content.trim();
    }
}
