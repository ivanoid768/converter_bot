import { createReadStream, createWriteStream } from 'fs';
import { convert } from './converter';

async function main() {
    let input = createReadStream('../корпус.mp3')
    console.log(input.path);
    let outFilename = `./temp/temp_${Math.round(Math.random() * 100)}.${'ogg'}`
    var writeStream = createWriteStream(outFilename);

    let output = await convert(input, 'ogg')
    console.log(output.writable);
    output.pipe(writeStream)

    output.on('data', function (chunk) {
        console.log('ffmpeg just wrote ' + chunk.length + ' bytes');
    });
}

main().catch(console.log)