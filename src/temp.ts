import { createReadStream, createWriteStream } from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { convert, getFormats } from './converter';
import { PassThrough } from 'stream';
import { env } from 'process';
import { inspect } from 'util';

export async function main() {
    let formats = await getFormats()
    console.log(inspect(formats, true, 10, true));

    console.log(env.FFPROBE_PATH);
    // let input = createReadStream('../13 Wasted Air.mp3')
    // return ffmpeg(input)
    //     // .outputFormat('Windows Media Audio 2')
    //     .audioCodec('wmav2')
    //     .format('asf')
    //     .pipe()
    // .save('./temp/13 Wasted Air.wma')
    // .ffprobe((data) => {
    //     console.log(inspect(data, true, 10, true));

    // })

    // ffprobe('../корпус.mp3', console.log)
}

export async function main_1() {
    let input = createReadStream('../корпус.mp3')
    console.log(input.path);
    ffmpeg().availableCodecs((err, codecs) => {
        if (err) {
            return;
        }
        console.log(codecs);
        for (const key in codecs) {
            if (codecs.hasOwnProperty(key)) {
                const codec = codecs[key];
                if (codec.type === 'audio') {
                    console.log(codec);
                }
            }
        }

    })
    // let readble = new ReadableStream()

    let outFilename = `./temp/temp_${Math.round(Math.random() * 100)}.${'ogg'}`
    let writeStream = createWriteStream(outFilename);

    let output = await convert(input, 'ogg') as PassThrough;
    console.log(output.writable, output.readable);
    output.pipe(writeStream)

    output.on('data', function (chunk) {
        console.log('ffmpeg just wrote ' + chunk.length + ' bytes');
    });
}