import * as http from 'http'
import { handlers } from '.';

function serverListner(
    req: http.IncomingMessage,
    res: http.ServerResponse
) {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    

}



export { serverListner }