import { db } from '../../../../initlisers/databaseInitliser'
import { commands } from './commandMap'
import * as http from "http";

const path = '/api/v0/discord'
const special = false
const config = {
    quickHandle: '/api/v0/discord/notifications'
}

var t = false
async function handler(
    req: http.IncomingMessage,
    res: http.ServerResponse
) {
    var data: any = ''
    req.setEncoding('ascii')
    req.on('data', (d) => data += d)
    req.on('end', () => {
        data = JSON.parse(data)
        res.writeHead(200, 'OK', { 'Content-Type': 'application/json' })
        console.log(data)
        res.write(JSON.stringify(commands.get(data.type).command(data)))
        res.end()
    })
}

export { path, config, special, handler }