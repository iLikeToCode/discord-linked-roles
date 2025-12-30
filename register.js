import roles from "./roleMap.json" with { type: "json" }
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

const body = Object.keys(roles).map(key => ({
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

if (response.ok) {
  const data = await response.json();
  console.log(data);
} else {
  const data = await response.text();
  console.log(data);
}
