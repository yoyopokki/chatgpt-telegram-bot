import { Injectable, Logger } from '@nestjs/common';
import { Context, Telegraf } from 'telegraf';
import { OpenaiService } from '../openai/openai.service';

@Injectable()
export class TelegramBotService {
    private readonly bot: Telegraf<Context>;
    private readonly logger = new Logger(TelegramBotService.name);

    constructor(private readonly openaiService: OpenaiService) {
        this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
        this.registerHandlers();
    }

    start(): void {
        this.bot.launch().then(() => {
            this.logger.log('Бот запущен');
        });
    }

    private registerHandlers(): void {
        this.bot.start(this.handleStartCommand.bind(this));
        this.bot.help(this.handleHelpCommand.bind(this));
        this.bot.command('generate', this.handleGenerateCommand.bind(this));
    }

    private async handleStartCommand(ctx: Context): Promise<void> {
        await ctx.reply('Привет, я бот, который поможет тебе пользоваться ChatGPT 3.5 и в х*й не дуть');
    }

    private async handleHelpCommand(ctx: Context): Promise<void> {
        await ctx.reply(
            '/generate - Генерация текста с помощью OpenAI GPT-3.\n\n' +
            'Выполни команду: /generate <ваш текст>',
        );
    }

    private async handleGenerateCommand(ctx: Context): Promise<void> {
        // @ts-ignore
        const textPrompt = ctx.message.text.substring(10);

        if (!textPrompt) {
            await ctx.reply('Введите пожалуйста текст для ChatGPT');
            return;
        }

        try {
            const generatedText = await this.openaiService.completePrompt(textPrompt);
            await ctx.reply(generatedText);
        } catch (error) {
            this.logger.error(error);
            await ctx.reply('Ошибка генерации текста');
        }
    }
}
