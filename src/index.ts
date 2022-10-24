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
}

export { config, processEventEmitter }