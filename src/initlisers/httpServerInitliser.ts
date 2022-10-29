import { serverListner } from '../serverListner'
import { processEventEmitter } from '..'
import * as http from 'http'

processEventEmitter.on('http:init:start', async () => {

    const server = http.createServer({}, serverListner)

    server.listen(80)
    server.once('listening', processEventEmitter.emit.bind(processEventEmitter, 'http:init:finish'))
})