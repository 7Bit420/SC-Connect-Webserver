import * as http from "http";

const path = '/test'
const special = false
const config = {
    quickHandle: '/test'
}

async function handler(
    req: http.IncomingMessage,
    res: http.ServerResponse
) {
    console.log('test')
    req.on('data', process.stdout.write)
    req.on('end', () => res.end())
}

export { path, config, special, handler }