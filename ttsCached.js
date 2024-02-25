const tts =require('./tts');
const NodeCache =require('node-cache');

const CACHE_SIZE = 50000;
const cache = new NodeCache({
    stdTTL: 0,
    checkperiod: 0,
    useClones: false,
})

cache.on('set', (key) => {
    let t1, t2;
    t1 = performance.now();
    let vsize = cache.getStats().vsize;
    t2 = performance.now();
    console.log(`get vsize perfomance: ${t2 - t1} ms`);
    // console.log(`CACHE SET: ${key}`);
    // console.log(`cache size: ${Math.round(vsize / 100) / 10}KB`);

    if (vsize <= CACHE_SIZE) {
        return;
    }
    
    const keys = cache.keys().filter(k => k !== key);
    while (vsize > CACHE_SIZE && keys.length > 0) {
        const idx = Math.floor(Math.random() * keys.length);
        const delKey = keys[idx];
        cache.del(delKey);
        keys.splice(idx, 1);

        vsize = cache.getStats().vsize;

        console.log(`DELETED: ${delKey}, CACHE NEW SIZE: ${vsize}KB`);
    }
})


async function ttsCached(text, voice, speed) {
    const key = `${voice}-${speed}-${text}`;
    if (cache.has(key)) {
        console.log(`CACHE HIT: ${key}`);
        return cache.get(key);
    }
    const res = await tts(text, voice, speed);
    cache.set(key, res);
    return res;
}

module.exports = ttsCached;
