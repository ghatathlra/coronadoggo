const rp = require('request-promise');
const {tage} = require('../utils/tage');
const {BOT_TOKEN} = process.env;

let bot_information = {};

function get_me() {
    return bot_information;
}

async function polling_whoami() {
    try {
        const res = await rp({
            uri: `https://api.telegram.org/bot${BOT_TOKEN}/getMe`,
            method: 'GET',
            json: true,
        });
        if (res.ok && res.result) {
            bot_information = res.result;
        } else {
            throw tage('TELEGRAM_BOT:bot_get_me', new Error(JSON.stringify(res)));
        }
    } catch (err) {
        err = tage('TELEGRAM_BOT:polling_whoami', err);
        console.error(err.message);
    }
}

polling_whoami();
setInterval(polling_whoami, 60000);

module.exports = {get_me};