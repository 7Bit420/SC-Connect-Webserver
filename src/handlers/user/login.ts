import { db } from '../../initlisers/databaseInitliser'
import * as http from "http";
import { session } from '../../util/session';
import { genLongID } from '../../util/genLongID';

const path = '/user/login'
const special = false
const config = {
    quickHandle: '/user/login'
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

    var sessions: session[] = (await db.query<session>(`SELECT sessions.*.* FROM ${user.id} PARALLEL`))[0].result[0].sessions;
    sessions = sessions.filter(t=>{
        if ((t.expiresAt < Date.now()) || (t.sudo)) {
            db.delete(t.id)
            db.query(`UPDATE ${user.id} SET sessions -= ${t.id}`)
            return false
        }
        return true
    })

    if (sessions.length <= 0) {
        var sessionid = genLongID()
        var session = await db.create(`session:\`${sessionid}\``, {
            expiresAt: Date.now() + 21600000, // 6 Hours
            createdAt: Date.now(),
            sudo: false,
            user: user.id
        })

        db.query(`UPDATE ${user.id} SET sessions += ${session.id}`)

        res.writeHead(200, "Session Created", { 'Content-Type': 'application/json' })
        res.write(JSON.stringify({
            code: 200,
            error: "Session Created",
            id: session.id.replace(/[^A-Z,a-z,\-,0-9,\:]/g,'`')
        }))
        return res.end()
    } else {
        var updateSession = sessions.splice(sessions.findIndex(t => !t.sudo), 1)[0]

        try {
            db.modify(updateSession.id, [{
                op: 'replace',
                path: 'expiresAt',
                value: Date.now() + 21600000,
            }])
        } catch (err) {
            console.log('Modify')
        }

        res.writeHead(200, "Session Renued", { 'Content-Type': 'application/json' })
        res.write(JSON.stringify({
            code: 200,
            message: "Session Renued",
            id: updateSession.id.replace(/[^A-Z,a-z,\-,0-9,\:]/g,'`'),
            expiresAt: updateSession.expiresAt
        }))
        return res.end()
    }
}

export { path, config, special, handler, session }