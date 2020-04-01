const {Channel, Subscription} = require('../../models/index');
const {Sequelize} = require('../../models/index');
const rp = require('request-promise');
const {tage} = require('../utils/tage');

const {Op} = Sequelize;
const {BOT_TOKEN} = process.env;

async function handle_update(req, res) {
    const update = req.body;
    const msg = update.message || update.edited_message;
    const chat = msg ? msg.chat : {}

    try {
        const msg_text = msg.text;

        if (/^\/newchan/.test(msg_text)) {
            const [command, channel_name, password] = msg_text.split(/\s+/);
            await Channel.create({channel_name, password});
            await reply(chat.id, 'Channel has been created successfully');
        } else if (/^\/subscribe/.test(msg_text)) {
            const [command, chname, psswd] = msg_text.split(/\s+/);
            const channel_name = chname || '';
            const password = psswd || '';
            const channel = await Channel.findOne({where: {[Op.and]: [{channel_name}, {password}]}});
            if (channel) {
                await Subscription.findOrCreate({
                    where: {[Op.and]: [{channel_name}, {chat_id: chat.id}]},
                    defaults: {channel_name, chat_id: chat.id},
                });
                await reply(chat.id, `Subscribed for ${channel_name}`);
            } else {
                await reply(chat.id, 'Did you forget your channel or password? 😰');
            }
        } else if (/^\/unsubscribe/.test(msg_text)) {
            const [command, chname] = msg_text.split(/\s+/);
            const channel_name = chname || '';
            const sub = await Subscription.findOne({where: {[Op.and]: [{channel_name}, {chat_id: chat.id}]}});
            if (sub) {
                await sub.destroy({force: true});
                await reply(chat.id, `Unsubscribed for ${channel_name}`);
            } else {
                await reply(chat.id, 'To unsubscribe this channel, you must subscribe it first! 👌👌👌');
            }
        }

    } catch (err) {
        await reply(chat.id, 'Sorry, Doge cannot do this right now 😰');
        console.error(err.message);
    } finally {
        res.json({success: true, message: '', data: {}});
    }

}

async function reply(chat_id, message) {
    try {
        await rp({
            uri: `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
            method: 'POST',
            body: {chat_id, text: message},
            json: true,
        });
        return;
    } catch (err) {
        err = tage('TELEGRAM_BOT:reply', err);
        console.error(err.message);
    }
}

module.exports = {handle_update};