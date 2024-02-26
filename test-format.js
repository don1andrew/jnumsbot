const { performance } = require('perf_hooks');

let t1, t2, f1, f2, tt1, tt2;

const N = 300000;
const texts = new Array(N);
for (let i = 0; i < N; i++) {
    const base = `${Math.floor(Math.random() * 100)}`;
    const txt = `${base}${Math.random() < 0.5 ? '' : '日'}`;
    texts[i] = txt;
}

t1 = performance.now();
for (let i = 0; i < N; i++) {
    const key = `voice-${Math.random() + 0.5}-${texts[i]}`;
}
t2 = performance.now();

f1 = performance.now();
for (let i = 0; i < N; i++) {
    const key = `voice-${new Intl.NumberFormat('en', { minimumSignificantDigits: 4 }).format(Math.random() + 0.5)}-${texts[i]}`;
}
f2 = performance.now();

tt1 = performance.now();
for (let i = 0; i < N; i++) {
    const key = `voice-${`${Math.random() + 0.5}`.padEnd(5, '0')}-${texts[i]}`;
}
tt2 = performance.now();


ta1 = performance.now();
for (let i = 0; i < N; i++) {
    const key = `voice-${`${Math.random() + 0.5}`.padEnd(5, '0')}-${texts[i].endsWith('日') ? '' : 'num'}${texts[i]}`;
}
ta2 = performance.now();

console.group();
console.log(`simple key perfomance: ${
    (t2 - t1) / N} ms each of ${N} ops`
);
console.log(`formatted key perfomance: ${
    (f2 - f1) / N} ms each of ${N} ops`
);
console.log(`custom key perfomance: ${
    (tt2 - tt1) / N} ms each of ${N} ops`
);
console.log(`parse num key perfomance: ${
    (ta2 - ta1) / N} ms each of ${N} ops`
);
console.groupEnd();