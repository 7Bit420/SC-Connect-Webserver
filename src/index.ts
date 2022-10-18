import { serverListner } from './serverListner'
import * as http from 'http'

interface handler {
    path: string,
    special: boolean
    handler: (
        req: http.IncomingMessage,
        res: http.ClientRequest
    ) => void
}

const handlers: handler[] = []

const server = http.createServer({},serverListner)

server.listen(80)

export { server, handlers }