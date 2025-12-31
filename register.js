import { roleMap, rolesToAddViewPerm } from "./roles.js";
import dotenv from "dotenv";
dotenv.config();

const c = {
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    token: process.env.DISCORD_TOKEN,
    secret: process.env.COOKIE_SECRET,
}

const url = `https://discord.com/api/v10/applications/${c.client_id}/role-connections/metadata`;

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

const body = Object.keys(roleMap).map(key => ({
    key,
    name: capitalize(key),
    description: `${capitalize(key)} Rank`,
    type: 7
}));

const response = await fetch(url, {
  method: 'PUT',
  body: JSON.stringify(body),
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bot ${c.token}`,
  },
});

if (!response.ok) {
  const data = await response.text();
  console.log(data);
}

console.log("Metadata uploaded!")

async function getChannels() {
    const res = await fetch(`https://discord.com/api/v10/guilds/1404877164213571785/channels`, {
        headers: {
            Authorization: `Bot ${c.token}`,
        },
    });
    return res.json();
}

async function addViewPermission(channelId, id) {
    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/permissions/${id}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bot ${c.token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 0,
            allow: `${1 << 10}`,
            deny: '0',
        }),
    });
    if (res.status == 429) throw new Error("Rate Limit Reached")
}

const channels = await getChannels();

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

for (const channel of channels) {
  if (['GUILD_TEXT', 'GUILD_FORUM', 'GUILD_NEWS'].includes(channel.type)) {
    for (const id of Object.values(rolesToAddViewPerm)) {
      await addViewPermission(channel.id, id);
      console.log(`Added VIEW_CHANNEL for ${id} in ${channel.name}`);
      await wait(250);
    }
  }
}
