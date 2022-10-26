import { db } from '../../initlisers/databaseInitliser'
import * as http from "http";

const path = '/user/login'
const special = false
const config = {
    quickHandle: '/user/login'
}

interface session {
    expiresAt: number
    createdAt: number
    sudo: boolean
    user: string
    id: string
}

function genLongID() {
    return "xxxxxxxxxx-xxxxxxx-xxxxx-xxxxxxx-xxxxxxxxxx"
        .replace(/x/g, () => String.fromCharCode(Math.floor(Math.random() * 26) + 61))
}

async function handler(
    req: http.IncomingMessage,
    res: http.ServerResponse
) {
    var user = (await db.query(`SELECT * FROM user WHERE (username="${req.headers.username}" AND password="${req.headers.password}")`))[0].result[0]

    if (!user) {
        res.writeHead(400, "Invalid Login Credentials", { 'Content-Type': 'application/json' })
        res.write(JSON.stringify({
            code: 400,
            error: "Invalid Login Credentials",
            message: "The credentials you tried loging in with where invaild"
        }))
        return res.end()
    }

    if (user.sessions.length <= 0) {
        var session = await db.create('session:' + genLongID(), {
            expiresAt: Date.now() + 21600000, // 6 Hours
            createdAt: Date.now(),
            sudo: false,
            user: user.id
        })

        await db.query(`UPDATE ${user.id} SET sessions += ${session.id}`)

        res.writeHead(200, "Session Created", { 'Content-Type': 'application/json' })
        res.write(JSON.stringify({
            code: 200,
            error: "Session Created",
            id: session.id
        }))
        return res.end()
    } else {
        var sessions: session[] = (await db.query<{}>(`SELECT * FROM ${user.sessions.join(', ')}`))[0].result

        var updateSession = sessions.splice(sessions.findIndex(t => !t.sudo), 1)[0]
        sessions.filter(t => t.sudo).forEach(r => db.delete(r.id))

        db.update(updateSession.id, {
            expiresAt: updateSession.expiresAt + 21600000
        })

        res.writeHead(200, "Session Renued", { 'Content-Type': 'application/json' })
        res.write(JSON.stringify({
            code: 200,
            error: "Session Renued",
            id: updateSession.id
        }))
        return res.end()
    }
}

export { path, config, special, handler, session }