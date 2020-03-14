import Telegraf, { session, ContextMessageUpdate } from 'telegraf';
import axios from 'axios'
import { env } from 'process';
import { Audio } from 'telegraf/typings/telegram-types';

interface ISessionContext extends ContextMessageUpdate {
    session: Partial<{
        fileLink: string;
        audio: Audio;
        audioName: string;
    }>
}

const bot = new Telegraf<ISessionContext>((env.BOT_TOKEN as string))

bot.use(session())

bot.start((ctx) => ctx.reply('Welcome back, Boss! What file do you want me to convert?'))
bot.on('audio', async (ctx) => {
    console.log(ctx.update.message?.audio);
    let audio = ctx.update.message?.audio;
    console.log(audio?.performer, audio?.title);
    let fileId = ctx.update.message?.audio?.file_id;
    if (!fileId || !audio) {
        return;
    }

    let file = await ctx.telegram.getFile(fileId)
    let fileLink = await ctx.telegram.getFileLink(fileId)
    console.log(fileLink);
    ctx.session.fileLink = fileLink;
    ctx.session.audio = audio;
    ctx.session.audioName = audio.title || audio.performer || file.file_path;

    ctx.reply(`I see Boss. You want me to convert ${ctx.session.audioName} of ${audio.mime_type}. Please, choose output format:`)
})

bot.hears(/(mp3|ogg|wma)/i, async (ctx) => {
    console.log('session: ', ctx.session);
    if (!ctx.session.fileLink) {
        return;
    }

    console.log(ctx?.match?.[0], ctx.update.message?.text);
    await ctx.reply(`Ok Boss. I will convert ${ctx.session.audioName} from ${ctx.session.audio?.mime_type} to ${ctx?.match?.[0]}. I let you now when I done!`)
    let file = await axios.get<NodeJS.ReadableStream>(ctx.session.fileLink, { responseType: 'stream' })

    await ctx.replyWithAudio({ source: file.data }, { caption: 'File convertion done!', title: `${ctx.session.audioName}.${ctx?.match?.[0]}` })

    ctx.session.fileLink = undefined;
})

bot.launch()
