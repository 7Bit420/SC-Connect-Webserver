import * as http from 'http'
import { handlers, quickHandlers, specialHandlers, handler } from '.';

function serverListner(
    req: http.IncomingMessage,
    res: http.ServerResponse
) {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    var handler: handler;

    for (var i in quickHandlers.keys()) {
        if (reqUrl.pathname.startsWith(i)) {
            handler = quickHandlers.get(i);
            break
        }
    }
    if (!handler) {
        handlers.find(t => reqUrl.pathname.startsWith(t.path))
    }
    if (!handler) {
        handler = specialHandlers.get('default')
    }

    handler.handler(req, res)
}



export { serverListner }