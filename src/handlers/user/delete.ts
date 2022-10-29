import { db } from '../../initlisers/databaseInitliser'
import { checkSession } from "../../util/checkSession";
import { session } from "./login";
import * as http from "http";

const path = '/user/create'
const special = false
const config = {
    quickHandle: '/user/create'
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

    
}

export { path, config, special, handler }