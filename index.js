import * as d from './discord.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import roleMap from './roleMap.json' assert { type: 'json' };
import dotenv from "dotenv";
dotenv.config();


const c = {
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    token: process.env.DISCORD_TOKEN,
    secret: process.env.COOKIE_SECRET,
}

var app = express();

app.use(cookieParser(c.secret));

app.get('/linked-roles', function (req, res) {
    const { url, state } = d.getOauthUrl(process.env.DISCORD_REDIRECT_URI, process.env.DISCORD_CLIENT_ID)
    res.cookie('clientState', state, { maxAge: 1000 * 60 * 5, signed: true })
    return res.redirect(url)
});

app.get('/callback', async function (req,res) {const code = req.query['code'];
    const discordState = req.query['state'];

    const { clientState } = req.signedCookies;
    if (clientState !== discordState) return res.redirect('/linked-roles');

    try {
        const { access_token } = await d.getAccessToken(code, c.redirect_uri, c.client_id, c.client_secret);

        const { id, roles } = await d.getRoles(access_token);

        const metadata = {};
        for (const [key, roles_array] of Object.entries(map)) {
            roles_array.forEach(role => {
                if (roles.includes(role)) metadata[key] = true;
            });
        }

        await d.pushMetadata(access_token, c.client_id, metadata)

        return res.send(`Done. Assigned: ${Object.keys(metadata)}`)
    } catch (e) {
        if (e.message == "invalid_grant") {
            return res.redirect('/linked-roles')
        } else {
            console.log(e)
            return res.sendStatus(500);
        }
    }
});

app.listen(3001);
console.log('Express started on port 3001');
