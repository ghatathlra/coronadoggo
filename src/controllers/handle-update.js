const {Channel, Subscription} = require('../../models/index');
const {Sequelize} = require('../../models/index');
const rp = require('request-promise');
const {tage} = require('../utils/tage');
const {get_me} = require('../services/whoami');

const {Op} = Sequelize;
const {BOT_TOKEN} = process.env;

async function handle_update(req, res) {
    const update = req.body;
    const msg = update.message || update.edited_message;
    const chat = msg ? msg.chat : {}

    try {

        const msg_text = msg.text;
        const {first_name} = get_me();

        // if (/^\/newchan/.test(msg_text)) {
        //     const [command, channel_name, password] = msg_text.split(/\s+/);
        //     await create_channel(chat.id, channel_name, password);
        // } else 
        if (/^\/start/.test(msg_text)) {
            await reply(chat.id, `Hello there 👋👋👋. My name is ${first_name}. So nice to meet you! 😊\nGet to know me by /help command. 👌`);
        } else if (/^\/help/.test(msg_text)) {
            await reply(chat.id, [
                `These are what ${first_name} can do for you:\n`,
                '\n/subscribe [channel] [password] \n        Subscribe a channel with password\n',
                '\n/unsubscribe [channel] \n        Unsubscribe a channel\n',
                '\n/mychan \n        Show your subscribed channels',
            ].join(''));
        } else if (/^\/subscribe/.test(msg_text)) {
            const [command, channel_name, password] = msg_text.split(/\s+/);
            await subscribe_channel(chat.id, channel_name, password);
        } else if (/^\/unsubscribe/.test(msg_text)) {
            const [command, channel_name] = msg_text.split(/\s+/);
            await unsubscribe_channel(chat.id, channel_name);
        } else if (/^\/mychan/.test(msg_text)) {
            await get_my_channels(chat.id);
        } else {
            await reply(chat.id, `Sorry, ${first_name} don't understand what you're saying. 😰😰😰`)
        }

    } catch (err) {
        console.error(err.message);
    } finally {
        res.json({success: true, message: '', data: {}});
    }

}

async function create_channel(chat_id, channel_name, password) {
    const {first_name} = get_me();
    try {
        if (channel_name && password) {
            await Channel.create({channel_name, password});
            await reply(chat_id, 'Channel has been created successfully. 👍');
        } else {
            await reply(chat_id, `${first_name} need both channel name and password. 👌👌👌`);
        }
    } catch (err) {
        await reply(chat_id, `Sorry, ${first_name} cannot create new channel. 😰`);       
    }
}

async function subscribe_channel(chat_id, channel_name, password) {
    const {first_name} = get_me();
    try {
        channel_name = channel_name || '';
        password = password || '';
        const channel = await Channel.findOne({where: {[Op.and]: [{channel_name}, {password}]}});
        if (channel) {
            await Subscription.findOrCreate({
                where: {[Op.and]: [{channel_name}, {chat_id}]},
                defaults: {channel_name, chat_id},
            });
            await reply(chat_id, `Subscribed for ${channel_name}. 👍`);
        } else {
            await reply(chat_id, 'Did you forget your channel name or password?. 😰');
        }
    } catch (err) {
        await reply(chat_id, `Sorry, ${first_name} cannot subscribe to this channel. 😰`);
    }
}

async function unsubscribe_channel(chat_id, channel_name) {
    const {first_name} = get_me();
    try {
        channel_name = channel_name || '';
        const sub = await Subscription.findOne({where: {[Op.and]: [{channel_name}, {chat_id}]}});
        if (sub) {
            await sub.destroy({force: true});
            await reply(chat_id, `Unsubscribed ${channel_name}. 👍`);
        } else {
            await reply(chat_id, 'To unsubscribe this channel, you must subscribe it first! 👌👌👌');
        }
    } catch (err) {
        await reply(chat_id, `Sorry, ${first_name} cannot unsubscribe this channel. 😰`);
    }
}

async function get_my_channels(chat_id) {
    const {first_name} = get_me();
    try {
        const subs = await Subscription.findAll({where: {chat_id}});
        if (Array.isArray(subs) && subs.length > 0) {
            const channels_str = subs.map(sub => sub.getDataValue('channel_name')).join('\n');
            await reply(chat_id, `Channels you have subscribed:\n${channels_str}`);
        } else {
            await reply(chat_id, 'You haven\'t subscribed any channel yet.');
        }
    } catch (err) {
        await reply(chat_id, `Sorry, ${first_name} cannot show your subscribed channels right now. 😰`);
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