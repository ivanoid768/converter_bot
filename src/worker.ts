import { Worker, Job } from 'bullmq'
import { Readable, PassThrough } from 'stream';
import axios from 'axios';
import { Telegram } from 'telegraf'

import { CONVERT_QUEUE, connectionOpt, CPU_Count } from './config';
import { IConvertJob, IConvertJobData } from './types';
import { env } from 'process';
import { convert } from './converter';

const telegram = new Telegram((env.BOT_TOKEN as string))

export const worker = new Worker<IConvertJob>(CONVERT_QUEUE, async (job: Job<IConvertJobData>) => {
    console.log(job.id, job.name, job.data);
    let ctx = job.data;

    let file = await axios.get<Readable>(ctx.fileLink, { responseType: 'stream' })

    let output = await convert(file.data, ctx.outFormat) as PassThrough;

    let filename = `${ctx.audioName?.replace(/[.].*$/i, '')}.${ctx.outFormat}`
    console.log(filename);
    let performer = ctx.audio?.performer;
    if (performer) {
        filename = `${performer} - ${filename}`
    }

    // title: `${ctx.session.audioName}.${outFormat}`
    await telegram.sendDocument(ctx.clientId, { source: output, filename: filename }, { caption: 'File convertion done!' })
    await telegram.sendMessage(ctx.clientId, `Do you want me to convert something else? Just send me an audio file.`)

    return job.id;
}, {
    connection: connectionOpt,
    concurrency: CPU_Count - 1,
});