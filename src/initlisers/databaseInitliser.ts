import Surreal from "surrealdb.js"
import { processEventEmitter, config } from '../index'

const db: Surreal = new Surreal("http://127.0.0.1:8000/rpc");

async function login(
    username: string,
    password: string,
    maxAttempts: number = 10,
) {
    var errors = []
    return new Promise(async (res, reg) => {
        while (errors.length <= maxAttempts) {
            try {
                res(await db.signin({
                    user: username,
                    pass: password,
                }))
                break
            } catch (err) {
                errors.push(err)
                console.log(`Failed login on attempt ${errors.length}`)
            }
        }
        reg(errors)
    })
}

async function selectDB(
    namespace: string,
    database: string,
    maxAttempts: number = 10,
) {
    var errors = []
    return new Promise(async (res, reg) => {
        while (errors.length <= maxAttempts) {
            try {
                res(await db.use(namespace, database))
                break
            } catch (err) {
                errors.push(err)
                console.log(`Failed to select database on attempt ${errors.length}`)
            }
        }
        reg(errors)
    })
}

async function init() {
    await login(
        config.database.username,
        config.database.password,
    );

    await selectDB(config.database.namespace, 'users')

    processEventEmitter.emit('database:init:finish')
}

processEventEmitter.once('database:init:start', init)

export { db }