const tts = require('./tts');
const Cache = require('./cache3');

// const CACHE_SIZE = 50000;
const cache = new Cache({
    stdTTL: 0,
    checkperiod: 0,
    useClones: false,
    maxSize: 40000,
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
