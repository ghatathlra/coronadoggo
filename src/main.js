const express = require('express');
const cors = require('cors');

const {Channel} = require('../models/index');
const {handle_update} = require('./controllers/handle-update');
const {CHANNELS} = require('./constants/channels');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || 1307;
const {BOT_TOKEN} = process.env;

module.exports = async function() {
    try {
        const app = express();

        app.use(express.json());
        app.use(cors());

        app.get('/', (req, res) => {res.end('Corona doggo')});

        app.post(`/${BOT_TOKEN}`, handle_update);

        for (channel of CHANNELS) {
            await Channel.upsert({channel_name: channel.channel_name, password: channel.password});
        }

        app.listen(PORT, HOST, () => {console.log(`Coronadoggo is up on ${HOST}:${PORT} with environment ${process.env.NODE_ENV}`)});
    } catch (err) {
        console.error(err);
    }
}