import { createReadStream, createWriteStream } from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { convert } from './converter';
import { PassThrough } from 'stream';

export async function main() {
    let input = createReadStream('../корпус.mp3')
    console.log(input.path);
    ffmpeg().availableFormats(console.log)
    // let readble = new ReadableStream()

    let outFilename = `./temp/temp_${Math.round(Math.random() * 100)}.${'ogg'}`
    var writeStream = createWriteStream(outFilename);

    let output = await convert(input, 'ogg') as PassThrough;
    console.log(output.writable, output.readable);
    output.pipe(writeStream)

    output.on('data', function (chunk) {
        console.log('ffmpeg just wrote ' + chunk.length + ' bytes');
    });
}