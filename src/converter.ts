import ffmpeg, { FfprobeData } from 'fluent-ffmpeg';
import { Readable } from 'stream';

export async function convert(file: Readable, outFormat: string) {
    if (outFormat === 'wma') {
        return ffmpeg(file)
            .audioCodec('wmav2')
            .outputFormat('asf')
            .pipe()
    }

    return ffmpeg(file)
        .outputFormat(outFormat)
        .pipe()
}

export function getMeta(file: Readable) {
    return new Promise<FfprobeData>((resolve, reject) => {
        ffmpeg(file).ffprobe((err, data) => {
            if (err) {
                reject(err)
            }
            resolve(data)
        })
    })
}