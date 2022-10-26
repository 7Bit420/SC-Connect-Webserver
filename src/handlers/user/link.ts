import { db } from '../../initlisers/databaseInitliser'
import { session } from './login'
import * as http from "http";

const path = '/user/link'
const special = true
const config = {
    quickHandle: '/user/link'
}

async function handler(
    req: http.IncomingMessage,
    res: http.ServerResponse
) {
    const cookies = Object.fromEntries(req.headers.cookie.split('&').map(t => t.split('=').map(t => decodeURIComponent(t))))
    var loginSession: session = await db.select(cookies.sessionID)[0]

    if (!loginSession.sudo || (Date.now() > loginSession.expiresAt)) {
        res.writeHead(400, "Invalid Session", { 'Content-Type': 'application/json' })
        res.write(JSON.stringify({
            code: 400,
            error: "Invalid Session",
            message: "To link an intergration you must use a sudo session"
        }))
        if (Date.now() > loginSession.expiresAt) {
            db.delete(loginSession.id)
        }
        return res.end()
    }

    var user = await db.select(loginSession.user)[0]

    console.log(user)
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

export { path, config, special, handler }