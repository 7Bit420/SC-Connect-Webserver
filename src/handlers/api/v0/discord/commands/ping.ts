import { db } from '../../../../../initlisers/databaseInitliser'
import * as http from "http";

const path = '/api/v0/ping'
const special = false
const config = {
    quickHandle: '/api/v0/ping'
}

var t = false
async function handler(
    req: http.IncomingMessage,
    res: http.ServerResponse
) {
    res.writeHead(200, 'OK')
    res.write('PONG')
    res.end()
    console.log('┌PING────────────────────────────────────┐')
    console.log(`│IP  : ${req.socket.remoteAddress.padEnd(34,' ')}│`)
    console.log(`│DATE: ${new Date(Date.now()).toUTCString().padEnd(34,' ')}│`)
    console.log('└────────────────────────────────────────┘')
}

export { path, config, special, handler }