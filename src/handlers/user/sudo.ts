import { db } from '../../initlisers/databaseInitliser';
import { checkSession } from '../../util/checkSession';
import { session } from '../../util/session';
import * as http from "http";

const path = '/user/login/sudo'
const special = false
const config = {
    quickHandle: '/user/login/sudo'
}

function genLongID() {
    return "xxxxxxxxxx-xxxxxxx-xxxxx-xxxxxxx-xxxxxxxxxx"
        .replace(/x/g, () => String.fromCharCode(Math.floor(Math.random() * 26) + 97))
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


    var user: any = (await db.select(session.user))[0]

    if (!((user.password == req.headers.password) || user.username == req.headers.username)) {
        res.writeHead(400, "Invalid Credentials")
        res.write(JSON.stringify({
            code: 400,
            error: "Invalid Credentials",
            message: "The provided credentials are invalid for this session"
        }))
        return res.end()
    }

    await db.modify(session.id, [{
        value: true,
        op: 'replace',
        path: 'sudo'
    }, {
        value: Date.now() + 300000, // Five minutes
        op: 'replace',
        path: 'expiresAt'
    }])

    res.writeHead(200, "Session Sudoed")
    res.write(JSON.stringify({
        code: 200,
        message: "Your session hase been evelated, it will expire in 5 minutes",
        id: session.id
    }))
    return res.end()
}

export { path, config, special, handler, session }