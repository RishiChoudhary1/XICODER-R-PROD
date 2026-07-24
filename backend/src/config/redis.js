const { createClient }  = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'silvery-rainstorm-macrofast-52872.db.redis.io',
        port: 13997
    }
});

module.exports = redisClient;