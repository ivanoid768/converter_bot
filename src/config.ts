import os from 'os';
import { env } from 'process';

export const CONVERT_QUEUE = 'CONVERT_QUEUE';

const REDIS_HOST = env.REDIS_HOST;
const REDIS_PASSWORD = env.REDIS_PASSWORD;

export const connectionOpt = {
    host: REDIS_HOST,
    password: REDIS_PASSWORD,
}

export const CPU_Count = os.cpus().length

export const config = {
    outputFormats: [] as string[]
};