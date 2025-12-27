import * as d from './discord.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";
dotenv.config();
import { tokenStore } from './database.js'


const c = {
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    token: process.env.DISCORD_TOKEN,
    secret: process.env.COOKIE_SECRET,
    encryption_key: Buffer.from(process.env.ENCRYPTION_KEY, "hex")
}

console.log(c.encryption_key.length);

const t = tokenStore(c.encryption_key)

var app = express();

app.use(cookieParser(c.secret));

app.get('/linked-roles', function (req, res) {
    const { url, state } = d.getOauthUrl(process.env.DISCORD_REDIRECT_URI, process.env.DISCORD_CLIENT_ID)
    res.cookie('clientState', state, { maxAge: 1000 * 60 * 5, signed: true })
    return res.redirect(url)
});

app.get('/redirect', async function (req,res) {const code = req.query['code'];
    const discordState = req.query['state'];

    const { clientState } = req.signedCookies;
    if (clientState !== discordState) {
      console.error('State verification failed.');
      return res.sendStatus(403);
    }

    try {
        const { access_token, refresh_token } = await d.getAccessToken(code, c.redirect_uri, c.client_id, c.client_secret)
        const user = await d.whoisu(access_token)
        t.set(user.id, refresh_token)
        return res.send(`${user.username}, ${refresh_token}`)
    } catch (e) {
        if (e.message == "invalid_grant") {
            return res.redirect('/linked-roles')
        } else {
            return res.sendStatus(403);
        }
    }
});

app.listen(8787);
console.log('Express started on port 8787');