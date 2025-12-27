import crypto from 'crypto';

export function getOauthUrl(redirect_uri, client_id) {
    const state = crypto.randomUUID();
    const url = new URL('https://discord.com/api/oauth2/authorize');
	url.searchParams.set('client_id', client_id);
	url.searchParams.set('redirect_uri', redirect_uri);
	url.searchParams.set('response_type', 'code');
    url.searchParams.set('state', state);
	url.searchParams.set('scope', 'role_connections.write identify');
	url.searchParams.set('prompt', 'consent');
    return { url: url.toString(), state }
}

export async function getAccessToken(code, redirect_uri, client_id, client_secret) {
    const body = new URLSearchParams({
        client_id,
        client_secret,
        grant_type: "authorization_code",
        code,
        redirect_uri
    });
    const res = await fetch("https://discord.com/api/v10/oauth2/token", {
        body: body.toString(),
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
    });
    if (!res.ok) {
        throw new Error(await res.json().then(r => r.error));
    }
    const response = await res.json()
    return response
}

export async function whoisu(access_token) {
    const res = await fetch("https://discord.com/api/v10/users/@me", {
        headers: {
            Authorization: `Bearer ${access_token}`
        },
    });
    if (!res.ok) throw new Error(`Response: ${res.status}, ${await res.text()}`)
    const user = await res.json()
    return user
}