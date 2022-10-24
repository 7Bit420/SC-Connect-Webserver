import * as http from 'http'
import { handlers, quickHandlers, specialHandlers, handler } from '.';

function serverListner(
    req: http.IncomingMessage,
    res: http.ServerResponse
) {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);

    if (quickHandlers.has(reqUrl.pathname)) {
        quickHandlers.get(reqUrl.pathname).handler(req, res)
    } else {
        (
            handlers.find(t => reqUrl.pathname.startsWith(t.path)) ??
            specialHandlers.get('default')
        ).handler(req, res)
    }
}



export { serverListner }