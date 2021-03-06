import * as commando from 'discord.js-commando'
import {Message, TextChannel} from "discord.js";
import {CommandoMessage} from "discord.js-commando";
import {config, pg} from "../../bot";

export = class SyncCommand extends commando.Command {
    private readonly channel: string;
    constructor(client: commando.Client) {
        super(client, {
            name: 'remove',
            group: 'faq',
            memberName: 'delete',
            aliases: ['delete', 'rm'],
            description: 'Deletes a faq',
            argsPromptLimit: 0,
            userPermissions: ['MANAGE_MESSAGES'],
            guildOnly: true,
            args: [
                {
                    key: "id",
                    prompt: "What message do you want to remove?",
                    type: "string",
                    infinite: true
                }
            ]
        });
        this.channel = config.channel_id
    }

    public async run(msg: CommandoMessage, {id}: {id: string}): Promise<null> {
        let res = await pg.query("SELECT message_id, active FROM faq.faq WHERE message_id = $1 OR id = $1::bigint LIMIT 1", [id[0]]);
        if (res.rowCount === 0) {
            await msg.reply("Unable to locate that message, please check if the message id is correct");
            return null
        }
        if (res.rows[0].active === false) {
            await msg.reply("This faq is already deleted");
            return null
        }

        let channel = (await this.client.channels.fetch(this.channel)) as TextChannel;
        let message = await channel.messages.fetch(res.rows[0].message_id);
        await message.delete();
        await pg.query("UPDATE faq.faq SET active = false WHERE message_id = $1", [res.rows[0].message_id])
        await msg.react("✅")
        return null
    }
}
