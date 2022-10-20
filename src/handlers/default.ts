import * as http from 'http';
import { config as mainConfig } from '..';
import { get } from '../mime';
import * as fs from 'fs';
import * as os from 'os';

const path = 'default'
const special = true
const config = {}

function handler(
    req: http.IncomingMessage,
    res: http.ServerResponse
) {
    try {
        if (req.url == '/') {
            res.writeHead(200, 'OK', { 'Content-Type': 'text/html' })
            fs.createReadStream(`${mainConfig.readir}/pages/index.html`).pipe(res).on('drain', res.end)
        } else if (
            fs.existsSync(`${mainConfig.readir}/pages/${req.url}`) &&
            fs.lstatSync(`${mainConfig.readir}/pages/${req.url}`).isFile()
        ) {
            res.writeHead(200, 'OK', { 'Content-Type': 'text/html' })
            fs.createReadStream(`${mainConfig.readir}/pages/${req.url}`).pipe(res).on('drain', res.end)
        } else if (
            fs.existsSync(`${mainConfig.readir}/pages/${req.url}`) &&
            fs.lstatSync(`${mainConfig.readir}/pages/${req.url}`).isSymbolicLink()
        ) {
            res.writeHead(302, 'OK', { 'Location': fs.readlinkSync(`${mainConfig.readir}/pages/${req.url}`) })
            res.end()
        }
    } catch (err) {
        switch (Math.abs(err.errno)) {
            case os.constants.errno.EEXIST:
                res.writeHead(404, 'File Not Found')
                res.write(fs.readFileSync(mainConfig.readir + '/pages/errors/404.html'))
                break;
            case os.constants.errno.EISDIR:
                res.writeHead(404, 'Canot return dir')
                res.write(fs.readFileSync(mainConfig.readir + '/pages/errors/404.html'))
                break;
            default:
                console.log(err)
                res.writeHead(500, `Internal Error code ${err.errno}`)
                res.write(fs.readFileSync(mainConfig.readir + '/pages/errors/500.html'))
                break;
        }
        res.end()
    }
}

export {
    handler,
    path,
    special,
    config
}