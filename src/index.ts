import * as path from 'path'
import EventEmitter from 'events'

const processEventEmitter = new EventEmitter()

const config = {
    readir: process.env.READIR ?? path.resolve(__dirname, '../'),
    indexdir: __dirname,
    database: {
        username: 'root',
        password: 'root',
        namespace: 'test'
    },
    bootorder: [
        { name: "database", module: require('./initlisers/databaseInitliser') },
        { name: "mime", module: require('./initlisers/mimeInistliser') },
        { name: "handle", module: require('./initlisers/handleInitliser') },
        { name: "https", module: require('./initlisers/httpsServerInitliser') },
        { name: "http", module: require('./initlisers/httpServerInitliser') },
    ],
    discord: {
        clientID: "1034566036625817690",
        redirectURI: "http://localhost/user/link/callback/discord",
        secret: "7pkfBIrxYg37klCPG0mNWAgIIVCszoc9"
    }
};

(async () => {
    for (const initliser of config.bootorder) {
        console.log('INIT START:', initliser.name)
        await new Promise(res =>{
            processEventEmitter.once(`${initliser.name}:init:finish`, res)
            processEventEmitter.emit(`${initliser.name}:init:start`)
        })
        console.log('INIT FINISH:', initliser.name)
    }
})();

process.on('unhandledRejection', (err,promise)=>{
    console.log(err)
    promise.catch(console.log)
})

export { config, processEventEmitter }

// client_id=1034566036625817690&client_secret=7pkfBIrxYg37klCPG0mNWAgIIVCszoc9&token=wNs2n7iTwIECujumMy09VooMufs6tr