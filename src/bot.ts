import Telegraf, { session, ContextMessageUpdate } from 'telegraf';
import axios from 'axios'
import { env } from 'process';
import { Audio } from 'telegraf/typings/telegram-types';
import { getMeta } from './converter';
import { Readable } from 'stream';
import { convertQueue } from './queue';
import { config } from './config';

interface ISessionContext extends ContextMessageUpdate {
    session: Partial<{
        fileLink: string;
        audio: Audio;
        audioName: string;
        audioFormat: string;
    }>
}

const bot = new Telegraf<ISessionContext>((env.BOT_TOKEN as string))

bot.use(session())

bot.start(async (ctx) => {
    ctx.reply('Welcome back, Boss! What file do you want me to convert?')
})

bot.on('audio', async (ctx) => {
    console.log(ctx.update.message?.audio);
    let audio = ctx.update.message?.audio;
    console.log(audio?.performer, audio?.title, ctx.update.message);
    let fileId = ctx.update.message?.audio?.file_id;
    if (!fileId || !audio) {
        return;
    }

    let fileUploadMeta = await ctx.telegram.getFile(fileId)
    let fileLink = await ctx.telegram.getFileLink(fileId)
    console.log(fileLink);

    ctx.session.fileLink = fileLink;
    ctx.session.audio = audio;
    ctx.session.audioName = audio.title || audio.performer || fileUploadMeta.file_path;
    let performer = audio?.performer;
    if (performer && audio?.title) {
        ctx.session.audioName = `${performer} - ${audio.title}${fileUploadMeta.file_path?.match(/\.(\w+)$/gi)}`
    }

    await ctx.reply(`I see Boss. You want me to convert ${ctx.session.audioName}. Please, choose output format:`)

    let file = await axios.get<Readable>(fileLink, { responseType: 'stream' })
    let fileMediaMeta = await getMeta(file.data)
    ctx.session.audioFormat = fileMediaMeta.format.format_name || audio.mime_type;
})

bot.hears((text: string) => {
    console.log('hears: ', text);
    let formats = config.outputFormats.filter(format => format.indexOf(text) !== -1)
    console.log('outputFormat: ', formats);

    return formats.length > 0;
}, async (ctx) => {
    console.log('session: ', ctx.session);
    if (!ctx.session.fileLink || !ctx.update.message?.text) {
        return;
    }

    console.log(ctx.update.message.text, ctx.update.message?.text);
    let outFormat = ctx.update.message.text;
    await ctx.reply(`Ok Boss. I will convert ${ctx.session.audioName} from ${ctx.session.audioFormat} to ${ctx.update.message.text}. I let you now when I done!`)

    await convertQueue.add(`${ctx.from?.id}_${ctx.session.audioName}`, {
        audio: ctx.session.audio as Audio,
        clientId: ctx.from?.id as number,
        audioName: ctx.session.audioName as string,
        fileLink: ctx.session.fileLink as string,
        outFormat: outFormat,
    })

    ctx.session.fileLink = undefined;
})

export default bot;
