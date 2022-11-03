import * as http from "http";
import { db } from '../../initlisers/databaseInitliser'

const path = '/user/create'
const special = false
const config = {
    quickHandle: '/user/create'
}

const autoInfo = new Map([
    ["username", "string"],
    ["password", "string"],
    ["studentID", "number"]
])
const manualInfo = new Map([
    ["username", "string"],
    ["password", "string"],
    ["email", "string"]
])
const additinalInfo = new Map([
    ["email", "string"],
    ["studentID", "number"],
])

function stringToType(v: string): number | boolean | string {
    var rv: any = v;
    rv = Number(v)
    if (Number.isFinite(rv) && Number.isSafeInteger(rv)) return rv;
    return v == "true" ? true : v == "false" ? false : v
}

async function handler(
    req: http.IncomingMessage,
    res: http.ServerResponse
) {
    if (req.method != "POST") {
        res.writeHead(400, "Invalid Request Method", { 'Content-Type': 'application/json' })
        res.write(JSON.stringify({
            error: "Invalid Request Method",
            code: 400
        }))
        return res.end()
    }

    var reqData = ""
    req.on('data', d => reqData += d.toString('ascii'))
    await new Promise(res => req.on('end', res))

    var userReqInfo = Object.fromEntries(
        reqData.split('&')
            .map(t => t.split('=')
                .map(t => decodeURIComponent(t))
            )
            .map(([t, a]) => [t, stringToType(a)])
    );

    var userFinalInfo = { 
        id: '',
        intergrations: [],
        notifications: [],
        sessions: []
    }

    if (userReqInfo.migratedAccount) {
        for (var k of autoInfo.keys()) {
            if (autoInfo.get(k) == typeof userReqInfo[k]) {
                userFinalInfo[k] = userReqInfo[k]
            } else {
                res.writeHead(400, "Invalid User Data", { 'Content-Type': 'application/json' })
                res.write(JSON.stringify({
                    error: "Invalid User Data",
                    message: `Invalid User Data "${k}" needs to be type "${autoInfo.get(k)}"`,
                    code: 400
                }))
                return res.end()
            }
        }
    } else {
        for (var k of manualInfo.keys()) {
            if (manualInfo.get(k) == typeof userReqInfo[k]) {
                userFinalInfo[k] = userReqInfo[k]
            } else {
                res.writeHead(400, "Invalid User Data", { 'Content-Type': 'application/json' })
                res.write(JSON.stringify({
                    error: "Invalid User Data",
                    message: `Invalid User Data ${k} needs to be type "${manualInfo.get(k)}"`,
                    code: 400
                }))
                return res.end()
            }
        }
    }

    for (var k of additinalInfo.keys()) {
        if ((additinalInfo.get(k) == typeof userReqInfo[k]) || (typeof userReqInfo[k] == "undefined")) {
            userFinalInfo[k] = userReqInfo[k]
        } else {
            res.writeHead(400, "Invalid User Data", { 'Content-Type': 'application/json' })
            res.write(JSON.stringify({
                error: "Invalid User Data",
                message: `Invalid User Data ${k} needs to be type "${additinalInfo.get(k)}"`,
                code: 400
            }))
            return res.end()
        }
    }

    try {
        var query: any = (await db.query(`SELECT * FROM user WHERE (username = ${userFinalInfo['username']}) OR ${userReqInfo.migratedAccount ? `(email = ${userFinalInfo['email']})` : `(studentID = ${userFinalInfo['studentID']})`}`))[0].result
        if (query.length > 0) {
            res.writeHead(400, "User Created", { 'Content-Type': 'application/json' })
            res.write(JSON.stringify({
                code: 400,
                error: "user already exsists",
                message: "a user allready exsists with that username or password"
            }))
            return res.end()
        }

        userFinalInfo.id = (await db.create('user', userFinalInfo)).id

        res.writeHead(200, "User Created", { 'Content-Type': 'application/json' })
        res.write(JSON.stringify({
            code: 200,
            user: userFinalInfo
        }))
        return res.end()
    } catch (err) {
        console.log(err)
        res.writeHead(500, "Internal Database Error", { 'Content-Type': 'application/json' })
        res.write(JSON.stringify({
            code: 500,
            error: "Internal Database Error",
            message: "An Internial Error Occoured when saveing user to database"
        }))
        return res.end()
    }
}

export { path, config, special, handler }