import { db } from '../../../initlisers/databaseInitliser';
import { checkSession } from '../../../util/checkSession';
import { session } from "../../../util/session";
import { config as mainConfig } from '../../..'
import * as http from "http";
import { genLongID } from '../../../util/genLongID';

const path = '/user/link/callback'
const special = false
const config = {
    quickHandle: '/user/link/callback'
}

interface intergrationSession {
    id: string
    intergation: string
    user: string
}

interface discordIntergtaionSession extends intergrationSession {
    scopes: string[]
}

interface discordTokenResponse {
    access_token: string,
    token_type: string,
    expires_in: number,
    refresh_token: string,
    scope: string,
}

async function handler(
    req: http.IncomingMessage,
    res: http.ServerResponse
) {
    const requrl = new URL(req.url, `http://${req.headers.host}`)

    switch (requrl.pathname.replace(path, '')) {
        case '/discord':
            var session: discordIntergtaionSession = (await db.select<discordIntergtaionSession>(requrl.searchParams.get('state')))[0]
            if (!session) {
                res.writeHead(400, "Invalid State")
                res.write(JSON.stringify({
                    code: 400,
                    error: "Invalid State",
                    message: "Your state did't link to a Intergation session"
                }))
                return res.end()
            }
            if (session.intergation != 'discord') {
                res.writeHead(400, "Invalid State")
                res.write(JSON.stringify({
                    code: 400,
                    error: "Invalid State",
                    message: "Your state did't link to a Intergation discord session"
                }))
                return res.end()
            }
            db.delete(session.id);
            new Promise((reg, resolve) => {
                var data = [
                    ['client_id', mainConfig.discord.clientID],
                    ['client_secret', mainConfig.discord.secret],
                    ['grant_type', 'authorization_code'],
                    ['code', requrl.searchParams.get('code')],
                    ['redirect_uri', mainConfig.discord.redirectURI]
                ]
                var req = http.request({
                    pathname: '/api/oauth2/token',
                    host: 'discord.com',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }, (res) => {
                    var response = ''
                    res.on('data', data => response += data.toString('ascii'))
                    res.on('end', () => resolve(JSON.parse(response)))
                })
                req.write(data.map(t => t.map(n => encodeURIComponent(n)).join('=')).join('&'))
                req.end()
            }).then((res: any) => {
                res['intergration'] = 'discord'
                res['user'] = session.user
                db.create(`intergration:${genLongID()}`, res)
            })

            res.writeHead(200, "Intergration Linked")
            res.write(JSON.stringify({
                code: 200,
                message: "Your intergration was successfuly linked"
            }))
            return res.end()
        default:
            res.writeHead(400, "Invalid Intergation")
            res.write(JSON.stringify({
                code: 400,
                error: "Invalid Intergation",
                message: "No implementation for that intergation"
            }))
            return res.end()
    }


    res.end()
}

/*

https://discord.com/oauth2/authorize
\    ?response_type=code
\    &client_id=157730590492196864
\    &scope=identify guilds.join
\    &state=15773059ghq9183habn
\    &redirect_uri=https://nicememe.website
\    &prompt=consent

*/

/* 

http://local.com/test
/   ?error=invalid_scope
/   &error_description=The+requested+scope+is+invalid%2C+unknown%2C+or+malformed.
/   &state=conection%3ATEST

connections ./
email ./
identify ./
messages.read ./
relationships.read ./

code -> d2G2ZylCb9HfP3oGEsZvfwy4QOPMTD

*/

/*

http://localhost/user/link/callback/discord
/   ?code=wNs2n7iTwIECujumMy09VooMufs6tr
/   &state=⟨%60link-session%60⟩%3Asjuli98izeuep02iphih

*/

export { path, config, special, handler }