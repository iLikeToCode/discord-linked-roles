import * as d from './discord.js';
import express from 'express';
import cookieParser from 'cookie-parser';
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

const roleMap = {
    "moderator": ["1404883567552761947"],
    "administrator": ["1404882968366944427"],
    "supervisor": ["1429824891968032798"],
    "chairman": ["1404877894790021180"],
}

const usersMap = {
    "stexa": ["709485318264324108"],
    "chairman": ["844951775106433024", "1335340924233846929"] // scooby, rug
}

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
        for (const [key, users] of Object.entries(map)) {
            if (users.includes(id)) {
                metadata[key] = true;
            }
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

app.listen(8787);
console.log('Express started on port 8787');