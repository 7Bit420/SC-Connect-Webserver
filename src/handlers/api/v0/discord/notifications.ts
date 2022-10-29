import * as http from "http";
import { db } from '../../../../initlisers/databaseInitliser'

const path = '/api/v0/discord'
const special = false
const config = {
    quickHandle: '/api/v0/discord/notifications'
}

async function handler(
    req: http.IncomingMessage,
    res: http.ServerResponse
) {
    console.log(`REQUEST AT ${new Date(Date.now()).toUTCString()} `.padEnd(50, '-'))
    req.on('data', (d)=>process.stdout.write(d))
    req.on('end', ()=>{
        console.log("\n--------------------------------------------------")
        res.end()
    })
}

export { path, config, special, handler }