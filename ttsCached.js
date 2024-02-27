const tts = require('./tts');
const Cache = require('./cache');

const cache = new Cache({
    stdTTL: 0,
    checkperiod: 0,
    useClones: false,
    maxSize: 50000000, // 50MB
})

async function ttsCached(text, voice, speed) {
    const key = `${voice}_${`${speed}`.padEnd(5, '0')}_${`${text}`.endsWith('日') ? '' : 'n__'}${text}`;
    if (cache.has(key)) {
        console.log(`CACHE HIT: ${key}`);
        return cache.get(key);
    }
    const res = await tts(text, voice, speed);
    cache.set(key, res);
    return res;
}

module.exports = ttsCached;
