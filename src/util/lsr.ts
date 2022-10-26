// @ts-nocheck
import * as fs from 'fs'

function lsr(path: string, dirent?: false): string[];
function lsr(path: string, dirent: true): fs.Dirent[];
function lsr(path: string, dirent?: boolean): fs.Dirent[] | string[] {
    return fs.readdirSync(path, { encoding: 'ascii', withFileTypes: dirent }).map(t => {
        if ((dirent ? t : fs.lstatSync(`${path}/${dirent ? t.name : t}`)).isDirectory()) {
            return lsr(`${path}/${dirent ? t.name : t}`, dirent)
        } else {
            return `${path}/${dirent ? t.name : t}`
        }
    }).flat()
}

export { lsr }