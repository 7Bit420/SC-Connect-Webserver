import Surreal from "surrealdb.js"
import { processEventEmitter, config } from '../index'

const db: Surreal = new Surreal("localhost:8000");

async function attemptFunc(
    maxAttempts: number = 10,
    func: (...any: any) => any,
    ...args: any
) {
    var errors = []
    return new Promise(async (res, reg) => {
        while (errors.length <= maxAttempts) {
            try {
                res(await func(...args))
            } catch (err) {
                errors.push(err)
            }
        }
        reg(errors)
    })
}

async function init() {
    await signIn(
        config.database.username,
        config.database.password,
        10
    );

    db.use(config.database.namespace, 'users')
}

processEventEmitter.once('database:init:start', init)