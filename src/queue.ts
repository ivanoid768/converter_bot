import { Queue, QueueEvents } from 'bullmq';
import { CONVERT_QUEUE, connectionOpt } from './config';
import { IConvertJobData } from './types';

export const convertQueue = new Queue<IConvertJobData>(CONVERT_QUEUE, {
    connection: connectionOpt,
});

const convertQueueEvents = new QueueEvents(CONVERT_QUEUE, {
    connection: connectionOpt,
});

convertQueueEvents.on('completed', async ({ jobId }) => {
    console.log(jobId);
})