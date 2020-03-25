import bot from "./bot";
import { worker } from "./worker";
import { config } from "./config";
import { getOutputFormats } from "./converter";

export async function main() {
    console.log('Start worker: ', worker.name);
    let { formatNames } = await getOutputFormats()
    config.outputFormats = formatNames;
    bot.launch()
}