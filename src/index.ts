import { serverListner } from './serverListner'
import * as http from 'http'

const server = http.createServer({},serverListner)

server.listen(80)

