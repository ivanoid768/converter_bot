import ffmpeg, { FfprobeData, Format, Codec } from 'fluent-ffmpeg';
import { Readable } from 'stream';

// let formats: string[] = [];
// let codecs: string[] = [];

// async function init() {
//     console.log('Converter init!');
//     formats = (await getFormats()).map(format => format.name);
//     codecs = (await getAudioCodecs()).map(codec => codec.name);
// }

// init()

export async function convert(file: Readable, outFormat: string) {
    console.log(outFormat);

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

export function getFormats() {
    return new Promise<{ name: string; formatProps: Format }[]>((resolve, reject) => {
        ffmpeg().availableFormats((err, formats) => {
            if (err) {
                reject(err)
            }

            let result = [];

            for (const key in formats) {
                if (formats.hasOwnProperty(key)) {
                    const format = formats[key];
                    result.push({
                        name: key,
                        formatProps: format,
                    })
                }
            }

            resolve(result)
        })
    })
}

export function getAudioCodecs() {
    return new Promise<{ name: string; codecProps: Codec; }[]>((resolve, reject) => {
        ffmpeg().availableCodecs((err, codecs) => {
            if (err) {
                reject(err)
            }

            let result = [];

            for (const key in codecs) {
                if (codecs.hasOwnProperty(key)) {
                    const codec = codecs[key];
                    if (codec.type === 'audio') {
                        result.push({
                            name: key,
                            codecProps: codec,
                        })
                    }
                }
            }

            resolve(result)
        })
    })
}

export async function getOutputFormats() {
    let formats = await getFormats()
    let codecs = await getAudioCodecs()
    let codecsNames = codecs.filter(codec => codec.codecProps.canEncode === true).map(codec => codec.name)
    let formatNames = formats.filter(format => format.formatProps.canMux === true).map(format => format.name)

    return { formatNames, codecsNames }
}