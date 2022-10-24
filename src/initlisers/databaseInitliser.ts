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
    await attemptFunc(10, db.signin, {
        user: config.database.username,
        pass: config.database.username,
    });

    await attemptFunc(10, db.use, config.database.namespace, 'users')

    processEventEmitter.emit('database:init:done')
}

processEventEmitter.once('database:init:start', init)

export { db }