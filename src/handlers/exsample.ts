import * as http from "http";
import { db } from '../initlisers/databaseInitliser'

const path = 'EXSAMPLE'
const special = false
const config = {
    quickHandle: 'EXSAMPLE'
}

async function handler(
    req: http.IncomingMessage,
    res: http.ServerResponse
) {

}

export { path, config, special, handler }