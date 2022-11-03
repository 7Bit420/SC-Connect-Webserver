import { db } from '../../initlisers/databaseInitliser'
import { checkSession } from "../../util/checkSession";
import { session } from "./login";
import * as http from "http";

const path = 'EXSAMPLE'
const special = false
const config = {
    quickHandle: 'EXSAMPLE'
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

    var user: any = (await db.select(session.user))[0];

    res.writeHead(200, 'OK', { 'Content-Type': 'application/json' })
    res.write(JSON.stringify({
        notifications: (await db.query(`SELECT notifications.*.* FROM ${user} PARRELL`))[0].result[0].notifications,
        code: 200,
        message: "Got Notifications"
    }))
    res.end()
}

export { path, config, special, handler }