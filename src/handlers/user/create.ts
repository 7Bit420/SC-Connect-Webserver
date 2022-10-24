import * as http from "http";
import * as surreal from "surrealdb.js"

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

    var userFinalInfo = {}

    if (userReqInfo.migratedAccount == true) {
        for (var k in autoInfo.keys()) {
            if (autoInfo[k] == typeof userReqInfo[k]) {
                userFinalInfo[k] = userReqInfo[k]
            } else {
                res.writeHead(400, "Invalid User Data", { 'Content-Type': 'application/json' })
                res.write(JSON.stringify({
                    error: "Invalid User Data",
                    message: `Invalid User Data ${k} needs to be type "${autoInfo[k]}"`,
                    code: 400
                }))
                return res.end()
            }
        }
    } else {
        for (var k in additinalInfo.keys()) {
            if (additinalInfo[k] == typeof userReqInfo[k]) {
                userFinalInfo[k] = userReqInfo[k]
            } else {
                res.writeHead(400, "Invalid User Data", { 'Content-Type': 'application/json' })
                res.write(JSON.stringify({
                    error: "Invalid User Data",
                    message: `Invalid User Data ${k} needs to be type "${additinalInfo[k]}"`,
                    code: 400
                }))
                return res.end()
            }
        }
    }
    for (var k in additinalInfo.keys()) {
        if ((additinalInfo[k] == typeof userReqInfo[k]) || (typeof userFinalInfo == "undefined")) {
            userFinalInfo[k] = userReqInfo[k]
        } else {
            res.writeHead(400, "Invalid User Data", { 'Content-Type': 'application/json' })
            res.write(JSON.stringify({
                error: "Invalid User Data",
                message: `Invalid User Data ${k} needs to be type "${additinalInfo[k]}"`,
                code: 400
            }))
            return res.end()
        }
    }

    // @TODO Send user data to database to be created

    if ("sucess") {
        res.writeHead(200, "User Created", { 'Content-Type': 'application/json' })
        res.write(JSON.stringify({
            code: 200,
            user: userFinalInfo
        }))
        return res.end()
    } else {
        res.writeHead(500, "Internal Database Error", { 'Content-Type': 'application/json' })
        res.write(JSON.stringify({
            code: 500,
            error: "Internal Database Error",
            message: "An Internial Error Occoured when saveing user to database"
        }))
        return res.end()
    }
}