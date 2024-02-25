const tts =require('./tts');
const NodeCache =require('node-cache');
const Cache = require('./cache2');

const CACHE_SIZE = 200;
const cache = new NodeCache({
    stdTTL: 0,
    checkperiod: 0,
    useClones: false,
})

const mcache = new Cache({
    stdTTL: 0,
    checkperiod: 0,
    useClones: false,
    maxSize: 0
});

cache.on('set', (key) => {
    let t1, t2;
    t1 = performance.now();
    let vsize = cache.getStats().vsize;
    t2 = performance.now();
    console.log(`get vsize perfomance: ${t2 - t1} ms`);
    console.log(`CACHE SET: ${key}`);
    console.log(`cache size: ${Math.round(vsize / 100) / 10}KB`);

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

        console.log(`DELETED: ${delKey}, CACHE NEW SIZE: ${Math.round(vsize / 100) / 10}KB`);
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
function getKey(text) {
    return `ja-JP-Wavenet-B-1-${text}`;
}
function getDate() {
    const date = new Date();
    date.setFullYear(Math.floor(
        (Math.random() * (2025 - 1900 + 1)) + 1900)
    );
    date.setMonth(Math.floor(Math.random() * 12));
    date.setDate(Math.ceil(Math.random() * 31));
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return { year, month, day };
}
function getNum(a, b) {
    return Math.floor(
        (Math.random() * (b - a + 1)) + a
    );
}



let iS = 1000, iM = 1000, iB = 100;
let idY = 76500, idMD = 1000, idD = 1000;

let f1, f2;
f1 = performance.now();

// fill with small numbers
for (let i = 0; i < iS; i++) {
    const num = getNum(0,10);
    mcache.set(getKey(num), num);
}
// fill with mid numbers
for (let i = 0; i < iM; i++) {
    const num = getNum(11,100);
    mcache.set(getKey(num), num);
}
// fill with big numbers
for (let i = 0; i < iB; i++) {
    const num = getNum(1000,100000);
    mcache.set(getKey(num), num);
}
// fill with full dates
for (let i = 0; i < idY; i++) {
    const d = getDate();
    mcache.set(getKey(`${d.year}年${d.month}月${d.day}日`), d);
}
// fill with month day dates
for (let i = 0; i < idMD; i++) {
    const d = getDate();
    mcache.set(getKey(`${d.month}月${d.day}日`), d);
}
// fill with day dates
for (let i = 0; i < idD; i++) {
    const d = getDate();
    mcache.set(getKey(`${d.day}日`), d);
}

f2 = performance.now();
console.group('----test----');
console.log(`fill perfomance: ${
    (f2 - f1) / (iS+iM+iB+idD+idY+idMD)} ms of ${iS+iM+iB+idD+idY+idMD} elems`
);
console.log(`cache size: ${Math.round(mcache.getStats().vsize / 100) / 10}KB`);
mcache.maxSize = mcache.getStats().vsize - 1;

let t1, t2;
t1 = performance.now();
const N = 20000;
for (let i = 0; i < N; i++) {
    const d = getDate();
    mcache.set(getKey(`${d.year}年${d.month}月${d.day}日`), d);
}
t2 = performance.now();
console.log(`fill over full perfomance: ${
    (t2 - t1) / N} ms of ${N} elems to ${mcache.keys().length}`
);
console.log(`CACHE size: ${Math.round(mcache.getStats().vsize / 100) / 10}KB`);
console.log(`KEYS size: ${Math.round(mcache.getStats().ksize / 100) / 10}KB`);
console.groupEnd();
// console.log(`fill perfomance: ${
//     (t2 - t1) / (iS + iB + iM + idD + idMD + idY)
// } ms of ${iS + iB + iM + idD + idMD + idY} elems`);

// console.log(mcache.keys().sort((a, b) => a.length - b.length >=0 ? -1 : 1));
// module.exports = ttsCached;
