import { serverListner } from '../serverListner'
import { processEventEmitter } from '..'
import * as http from 'http'

processEventEmitter.on('server:init:start', async () => {

    const server = http.createServer({}, serverListner)

    server.listen(80)
    server.once('listening', processEventEmitter.emit.bind(processEventEmitter, 'server:init:finish'))
})