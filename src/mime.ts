import * as index from './index';
import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const config = {
    readir: process.env.READIR ?? path.resolve(__dirname, '../')
}
var mimes = JSON.parse(fs.readFileSync(config.readir + '/config/mime.json').toString())

function get(path: string) {
    return mimes.find(t => path.endsWith(t.info.base)).name ?? 'text/plain'
}

function phraseCSV(path: string) {
    var data = fs.readFileSync(path).toString('ascii').trimEnd().split('\n').map(t => t.trimEnd().split(','))
    data.splice(0, 1)
    var head = ["mime", "name", "refrence"]
    return data.map(t => {
        var obj = { info: { prams: [], ext: '', base: '', type: '' } }
        t.forEach((t, i) => obj[head[i]] = t)
        obj["name"].split(/(?=[\+,\/,\;])/g).forEach((element) => {
            if (element.startsWith('+')) {
                obj.info.ext = element.replace('+', '')
            } else if (element.startsWith(';')) {
                obj.info.prams.push(element.replace(';', ''))
            } else if (element.startsWith('/')) {
                obj.info.base = element.replace('/', '')
            } else {
                obj.info.type = element
            }
        });
        return obj
    })
}

async function init() {
    var tmpDir = fs.mkdtempSync(`njs-`);
    var types = [
        'application',
        'audio',
        'font',
        'image',
        'message',
        'model',
        'multipart',
        'text',
        'video',
    ]
    var reqs = types.map(t => new Promise(resolve => {
        var req = http.get({
            path: `/assignments/media-types/${t}.csv`,
            host: 'www.iana.org',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15'
            }
        })

        req.on('response', async (res) => {
            if (!res.readable) {
                await new Promise(r => res.on('readable', r))
            }
            res.pipe(fs.createWriteStream(`${tmpDir}/${t}`))
                .on('close', resolve)
        })
    }));

    await Promise.all(reqs)

    console.log("Downloaded MIME CSVs")

    mimes = types.map(t => phraseCSV(`${tmpDir}/${t}`))

    fs.writeFileSync(config.readir + '/config/mime.json', JSON.stringify(mimes.flat()))

    fs.rmSync(tmpDir, { recursive: true, force: true })

    console.log("Updated MIMEs")
}

export { init, get }

if (require.main == module) init();
