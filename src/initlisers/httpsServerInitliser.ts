import { serverListner } from '../serverListner'
import { processEventEmitter } from '..'
import { config } from '../index'
import * as https from 'https'
import * as fs from 'fs'

processEventEmitter.on('https:init:start', async () => {

    const server = https.createServer({
        // key: fs.readFileSync(config.readir + '/config/cert/private.key'),
        // cert: fs.readFileSync(config.readir + '/config/cert/certificate.cert'),
    }, serverListner)

    server.listen(443)
    server.once('listening', processEventEmitter.emit.bind(processEventEmitter, 'https:init:finish'))
})
