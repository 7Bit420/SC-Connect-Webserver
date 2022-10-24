import * as path from 'path'
import EventEmitter from 'events'

const processEventEmitter = new EventEmitter()

const config = {
    readir: process.env.READIR ?? path.resolve(__dirname, '../'),
    database: {
        username: '',
        password: '',
        namespace: ''
    },
    bootorder: [
        "database",
        "mime",
        "handle",
        "server"
    ]
};



(async () => {
    for (const initliser in config.bootorder) {
        processEventEmitter.emit(`${initliser}:init:start`)
        await new Promise(res => processEventEmitter.once(`${initliser}:init:finish`, res))
    }
});

export { config, processEventEmitter }