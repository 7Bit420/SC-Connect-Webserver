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

lsr(__dirname + '/handlers').filter((t) => t.endsWith('.js')).forEach(t => {
    var handle: handler = require(`${__dirname}/handlers/${t}`);
    if (handle.special) {
        specialHandlers.set(handle.path, handle)
        return
    }
    if (!handle.handler || !handle.path) { return }

    if (handle.config?.quickHandle) {
        quickHandlers.set(handle.config.quickHandle, handle)
    }
    handlers.push(handle)
})

export { handlers, quickHandlers, specialHandlers }