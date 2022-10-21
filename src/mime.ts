import * as http from 'http';
import { config } from '.';
import * as fs from 'fs';
import * as os from 'os';

var mimes = []

function get(path: string) {
    return mimes.find(t => path.endsWith(t.name))
}

function phraseCSV(path: string) {
    var data = fs.readFileSync(path).toString('ascii').split('\n').map(t => t.split(','))
    var head = data.splice(0, 1)[0]
    return data.map(t => {
        var obj = {}
        t.forEach((t, i) => obj[head[i]] = t)
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