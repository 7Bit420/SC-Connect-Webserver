import * as http from 'http'
import { serverListner } from '../serverListner'

const server = http.createServer({}, serverListner)

server.listen(80)