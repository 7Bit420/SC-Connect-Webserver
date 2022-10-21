import { serverListner } from './serverListner'
import { lsr } from './util/lsr'
import * as http from 'http'
import * as path from 'path'
import { argv, exit } from 'process'
import { init } from './mime'

interface handler {
    path: string,
    special: boolean
    config?: {
        quickHandle: string
    }
    handler: (
        req: http.IncomingMessage,
        res: http.ServerResponse
    ) => void
}

const quickHandlers: Map<string, handler> = new Map();
const specialHandlers: Map<string, handler> = new Map();
const handlers: handler[] = [];
const config = {
    readir: process.env.READIR ?? path.resolve(__dirname, '../')
}

process.argv.splice(0,2)
switch (process.argv[0]) {
    case 'fetch-mime':
        console.log("Updateing MIME")
        init()
}

lsr(__dirname + '/handlers').filter((t) => t.endsWith('.js')).forEach(t => {
    var handle: handler = require(`${__dirname}/handlers/${t}`);
    if (handle.special) {
        specialHandlers.set(handle.path, handle)
        return
    }
    if (!handle.handler || !handle.path) { return }

    if (handle.config.quickHandle) {
        quickHandlers.set(handle.config.quickHandle, handle)
    }
    handlers.push(handle)
})

const server = http.createServer({}, serverListner)

server.listen(80)

export { server, handlers, quickHandlers, specialHandlers, handler, config }