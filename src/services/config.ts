import fs from "fs";
import * as yaml from "js-yaml";

export interface Config {
    channel_id: string
    token: string
    database: {
        user: string,
        host: string,
        database: string,
        password: string,
        port: number
    }
}

export function loadConfig(): Config {
    let fileContents = fs.readFileSync('./config.yml', 'utf-8');
    return <Config>yaml.safeLoad(fileContents);
}
