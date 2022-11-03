import { db } from '../../initlisers/databaseInitliser'
import { checkSession } from "../../util/checkSession";
import { session } from "./login";
import * as http from "http";

const path = '/user/delete'
const special = false
const config = {
    quickHandle: '/user/delete'
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
        await db.query(
            `DELETE (SELECT sessions.*.*, notifications.*.*, intergrations.*.* FROM ${session.user}); \n` +
            `UPDATE ${session.user} SET sessions=[], notifications=[], intergrations=[];\n` +
            `INSERT INTO archive (SELECT * FROM ${session.user});\n` +
            `DELETE ${session.user};`
        )
        res.writeHead(200, "Account Deleted")
        res.write(JSON.stringify({
            code: 200,
            error: "Account Deleted",
            message: "Account Deleted, please contanct an administratior for assistance if you did not intend to delete your account"
        }))
        return res.end()
    } catch (error) {
        console.log(error)
    }


}

export { path, config, special, handler }