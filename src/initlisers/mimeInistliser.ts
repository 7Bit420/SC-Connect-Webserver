import { processEventEmitter } from ".."
import { init } from "../mime"

processEventEmitter.once('mime:init:start', async () => {
    process.argv.splice(0, 2)
    switch (process.argv[0]) {
        case 'fetch-mime':
            console.log("Updateing MIME")
            await init()
    }
    processEventEmitter.emit('mime:init:finish')
})