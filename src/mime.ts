import * as http from 'http';
import { config } from '.';
import * as fs from 'fs';

var mimes = []

function get(path: string) {
    return mimes.find(t => path.endsWith(t.name))
}

function phraseCSV(path: string) {
    var data = fs.readFileSync(path).toString('ascii').split('\n').map(t => t.split(','))
    var head = data.splice(0, 0)[0]
    return data.map(t => {
        var obj = {}
        t.forEach((t, i) => obj[head[i]] = t)
        return obj
    })
}

async function init() {
    var tmpDir = fs.mkdtempSync('njs-');
    var types = [
        'application',
        'audio',
        'font',
        'example',
        'image',
        'message',
        'model',
        'multipart',
        'text',
        'video',
    ]
    var reqs = types.map(t => new Promise(res => http.get(`http://www.iana.org/assignments/media-types/${t}.csv`).pipe(
        fs.createWriteStream(`${tmpDir}/${t}`)
    ).on('drain', res)));

    await Promise.all(reqs)

    mimes = types.map(t => phraseCSV(`${tmpDir}/${t}`))

    fs.writeFileSync(config.readir + '/config/mime.json', JSON.stringify(mimes.flat()))
}

export { init, get }

if (require.main == module) init();