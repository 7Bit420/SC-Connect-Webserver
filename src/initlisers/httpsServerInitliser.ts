import { serverListner } from '../serverListner'
import { processEventEmitter } from '..'
import { config } from '../index'
import * as https from 'https'
import * as fs from 'fs'

processEventEmitter.on('https:init:start', async () => {
    const server = https.createServer({
        key: fs.readFileSync('/etc/letsencrypt/live/7bit.dev/privkey.pem', 'utf8'),
        cert: fs.readFileSync('/etc/letsencrypt/live/7bit.dev/cert.pem', 'utf8'),
        ca: fs.readFileSync('/etc/letsencrypt/live/7bit.dev/chain.pem', 'utf8'),
    }, serverListner)
    server.listen(443)
    server.once('listening', processEventEmitter.emit.bind(processEventEmitter, 'https:init:finish'));
})
