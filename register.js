import dotenv from "dotenv";
dotenv.config();

/**
 * Load environment variables from a .env file, if it exists.
 */

dotenv.config()

const c = {
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    token: process.env.DISCORD_TOKEN,
    secret: process.env.COOKIE_SECRET,
}

/**
 * Register the metadata to be stored by Discord. This should be a one time action.
 * Note: uses a Bot token for authentication, not a user token.
 */
const url = `https://discord.com/api/v10/applications/${c.client_id}/role-connections/metadata`;
const body = [
  {
    key: 'moderator',
    name: 'Moderator',
    description: 'Moderator Rank',
    type: 7,
  },
  {
    key: 'administrator',
    name: 'Administrator',
    description: 'Administrator Rank',
    type: 7,
  },
  {
    key: 'supervisor',
    name: 'Supervisor',
    description: 'Supervisor Rank',
    type: 7,
  },
  {
    key: 'chairman',
    name: 'Chairman',
    description: 'Chairman Rank',
    type: 7,
  }
];

(async () => {
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
})();
