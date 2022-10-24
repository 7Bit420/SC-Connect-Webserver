import { init } from "../mime"

process.argv.splice(0, 2)
switch (process.argv[0]) {
    case 'fetch-mime':
        console.log("Updateing MIME")
        init()
}