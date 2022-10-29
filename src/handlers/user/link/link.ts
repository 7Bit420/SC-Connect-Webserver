import { db } from '../../../initlisers/databaseInitliser';
import { checkSession } from '../../../util/checkSession';
import { session } from "../../../util/session";
import { config as mainConfig } from '../../..'
import * as http from "http";

const path = '/user/link'
const special = false
const config = {
    quickHandle: '/user/link'
}

async function handler(
    req: http.IncomingMessage,
    res: http.ServerResponse
) {
    const cookies = Object.fromEntries(req.headers.cookie.split(';').map(t => t.split('=').map(t => decodeURIComponent(t).trim())))

    var session: session = await checkSession(cookies.sessionID).catch((reg) => {
        res.writeHead(reg.code, reg.error)
        res.write(JSON.stringify(reg))
        res.end()
        return undefined
    })

    if (!session) { return }

    if (!session.sudo) {
        res.writeHead(400, "Invalid Session")
        res.write(JSON.stringify({
            code: 400,
            error: "Invalid Session",
            message: "To link an intergration you must use a sudo session"
        }))
        return res.end()
    }

    try {
        var user: any = (await db.select(session.user))[0]
    } catch (error) {
        console.log(error)
    }

    const requrl = new URL(req.url, `http://${req.headers.host}`)
    
    switch (requrl.searchParams.get('intergration')) {
        case 'discord':
            var scopes = ['identify', 'email', 'connections', 'messages.read']
            var linkSession = await db.create('link-session', {
                user: user.id,
                intergation: 'discord',
                scopes: scopes
            })
            var prams = [
                ['redirect_uri', mainConfig.discord.redirectURI],
                ['client_id', mainConfig.discord.clientID],
                ['scope', scopes.join(' ')],
                ['state', linkSession.id],
                ['response_type', 'code'],
            ]
            res.writeHead(302, "Intergration Redirect", {
                Location: `https://discord.com/oauth2/authorize?${prams.map(t => t.map(t => encodeURIComponent(t)).join('=')).join('&')}`
            })
            res.end()
            break;
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

connections
email
identify
messages.read
relationships.read <- Error (Requires Discord Approvel)

code -> d2G2ZylCb9HfP3oGEsZvfwy4QOPMTD

*/

export { path, config, special, handler }