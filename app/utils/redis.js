
const { createClient } = require('redis')
const REDIS_PORT = process.env.REDIS_PORT || 6379

const client = createClient(REDIS_PORT);
client.connect();
client.on('connect', () => {
    console.log(`redis client is running on port ${REDIS_PORT}`);
})

client.on('error', err => console.log('Redis Client Error', err));


const setCode = (email, code) => {
    return new Promise(async (resolve, reject) => {
        if (email && code) {
            await client.set(email, code)
            resolve('success')
        }
        else {
            reject('email or code is empty')
        }
    })
}

const getCode = (email) => {
    return new Promise(async (resolve, reject) => {
        if (email) {
            const value = await client.get(email)
            console.log(value);
            resolve(value)
        }

    })
}


module.exports = {
    setCode, getCode
}