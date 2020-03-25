import { Job } from "bullmq";
import { Audio } from "telegraf/typings/telegram-types";

export interface IConvertJob extends Job {

}

export interface IConvertJobData {
    clientId: number;
    audio: Audio;
    outFormat: string;
    fileLink: string;
    audioName: string;
    outExt: string;
}