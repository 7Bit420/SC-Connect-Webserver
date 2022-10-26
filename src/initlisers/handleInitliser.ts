import { config, processEventEmitter } from '..'
import { lsr } from '../util/lsr'
import * as http from 'http'

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

processEventEmitter.once('handle:init:start', async () => {
    for (var t of lsr(config.indexdir + '/handlers').filter((t) => t.endsWith('.js'))) {
        var handle: handler = require(t);
        if (handle.special) {
            specialHandlers.set(handle.path, handle)
            continue
        }
        if (!handle.handler || !handle.path) { continue }

        if (handle.config?.quickHandle) {
            quickHandlers.set(handle.config.quickHandle, handle)
        }
        handlers.push(handle)
    }
    processEventEmitter.emit('handle:init:finish')
})

export { handlers, quickHandlers, specialHandlers, handler }