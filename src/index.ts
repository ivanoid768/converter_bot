import { Telegraf } from 'telegraf';
import { env } from 'process';

const bot = new Telegraf(env.BOT_TOKEN as string)

bot.start((ctx) => ctx.reply('Welcome'))