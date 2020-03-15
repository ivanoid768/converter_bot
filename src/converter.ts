import ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';
// import { createWriteStream } from 'fs';

export async function convert(file: Readable, outFormat: string) {
    // let outStream = createWriteStream(`./temp/temp_${Math.round(Math.random() * 100)}.${outFormat}`)

    return ffmpeg(file)
        .outputFormat(outFormat)
        .pipe()
    // .stream(outStream)
}