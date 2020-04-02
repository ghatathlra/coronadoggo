const rp = require('request-promise');
const {tage} = require('../utils/tage');
const {Subscription, Sequelize} = require('../../models/index');
const {BOT_TOKEN} = process.env;
const {Op} = Sequelize;

async function send_notification(req, res) {
    try {
        let {channel_name, message} = req.body;
        if (channel_name && message) {
            channel_name = channel_name.trim();
            const subs = await Subscription.findAll({where: {[Op.or]: [{channel_name}, {channel_name: '_all_'}]}});
            subs.map(sub => sub.getDataValue('chat_id')).forEach(chat_id => {
                send_to_telegram(chat_id, message);
            });
            res.json({success: true, message: '', data: {}});
        } else {
            res.json({success: false, message: 'Missing channel name or message content', data: {}});
        }
    } catch (err) {
        err = tage('TELEGRAM_BOT:send_notification', err);
        console.error(err.message);
        res.json({success: false, message: err.message, data: {}});
    }
}

async function send_to_telegram(chat_id, message) {
    try {
        await rp({
            uri: `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
            method: 'POST',
            body: {chat_id, text: message},
            json: true,
        });
        return;
    } catch (err) {
        err = tage('TELEGRAM_BOT:send_to_telegram', err);
        console.error(err.message);
    }
}

module.exports = {send_notification};