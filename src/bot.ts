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
        audioExt: string;
    }>
}

const bot = new Telegraf<ISessionContext>((env.BOT_TOKEN as string))
let outFormatList: string[] = [];

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

bot.on('message', async (ctx) => {
    console.log('session: ', ctx.session);
    if (!ctx.session.fileLink || !ctx.update.message?.text) {
        return;
    }

    let inpText = ctx.update.message.text;
    let formats = config.outputFormats.filter(format => format.indexOf(inpText) !== -1)
    if (formats.length <= 0) {
        await ctx.reply(`Sorry, Boss. I can't convert to ${inpText} :( . Maybe You want to convert to some other format?`)

        return;
    }
    if (formats.length > 1) {
        outFormatList = formats;
        let formatsText = formats.join('\n')
        let inlineFormats = formats.map(format => ([{
            callback_data: format,
            text: format,
        }]))

        await ctx.reply(`Your input ${inpText} match some formats: \n ${formatsText} \n Which one to choose?`, {
            reply_markup: {
                inline_keyboard: inlineFormats
            }
        })

        ctx.session.audioExt = inpText;

        return;
    }

    ctx.session.audioExt = inpText;
    console.log(ctx.update.message.text, ctx.update.message?.text);
    let outFormat = formats[0];
    await startConversion(ctx, outFormat)
})

bot.on('callback_query', async (ctx) => {
    if (!ctx.session.fileLink || !ctx.callbackQuery?.data) {
        return;
    }

    if (outFormatList.filter(format => ctx.callbackQuery?.data === format).length <= 0) {
        return;
    }

    let outFormat = ctx.callbackQuery.data
    await startConversion(ctx, outFormat)
})

async function startConversion(ctx: ISessionContext, outFormat: string) {
    await ctx.reply(`Ok Boss. I will convert ${ctx.session.audioName} from ${ctx.session.audioFormat} to ${outFormat}. I'll let you now when I done!`)

    await convertQueue.add(`${ctx.from?.id}_${ctx.session.audioName}`, {
        audio: ctx.session.audio as Audio,
        clientId: ctx.from?.id as number,
        audioName: ctx.session.audioName as string,
        fileLink: ctx.session.fileLink as string,
        outFormat: outFormat as string,
        outExt: ctx.session.audioExt as string,
    })

    delete ctx.session.audioExt;
    delete ctx.session.fileLink;
}

export default bot;
