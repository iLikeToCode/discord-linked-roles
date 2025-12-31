import * as d from './discord.js';
import express from 'express';
import { roleMap } from './roles.js';
import dotenv from "dotenv";
dotenv.config();


const c = {
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    token: process.env.DISCORD_TOKEN,
}

var app = express();

console.log(d.getOauthUrl(process.env.DISCORD_REDIRECT_URI, process.env.DISCORD_CLIENT_ID))


app.get('/', (req, res) => res.redirect('/linked-roles'));

app.get('/linked-roles', function (req, res) {
    const { url } = d.getOauthUrl(process.env.DISCORD_REDIRECT_URI, process.env.DISCORD_CLIENT_ID)
    return res.redirect(url)
});

app.get('/callback', async function (req,res) {const code = req.query['code'];
    try {
        const { access_token } = await d.getAccessToken(code, c.redirect_uri, c.client_id, c.client_secret);

        const { roles } = await d.getMember(access_token);

        const metadata = {};
        for (const [key, roles_array] of Object.entries(roleMap)) {
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
