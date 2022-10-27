import { db } from '../initlisers/databaseInitliser'
import { session } from './session'

async function checkSession(id?: string): Promise<session> {
    return new Promise(async (res, reg) => {

        if (!id) {
            return reg({
                code: 400,
                error: "No SessionID",
                message: "You must specify a session id"
            })
        }

        try {
            var loginSessions: session[] = await db.select(id)
            var loginSession: session = loginSessions[0]
        } catch (err) {
            return reg({
                code: 400,
                error: "Invalid Session",
                message: "No session was found with that id"
            })
        }

        if (!loginSession) {
            return reg({
                code: 400,
                error: "Invalid Session",
                message: "No session was found with that id"
            })
        }

        if (Date.now() > loginSession?.expiresAt) {
            try {
                db.delete(loginSession.id)
            } catch (err) {
                console.log(err)
            }
            return reg({
                code: 400,
                error: "Invalid Session",
                message: "Your session has expired"
            })
        }

        res(loginSession)
    })
}

export { checkSession }