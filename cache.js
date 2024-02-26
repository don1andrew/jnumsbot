const NodeCache = require('node-cache');

class Cache extends NodeCache {
    // maxSize;
    constructor(options) {
        super(options);
        this.maxSize = options?.maxSize ?? 0;

        this.on('set', (key) => {
            let vsize = this.getStats().vsize;
            // console.log(`CACHE SET: ${key}`);
            // console.log(`CACHE size: ${Math.round(vsize / 100) / 10}KB`);
        
            if (vsize <= this.maxSize || this.maxSize === 0) {
                return;
            };
            
            const keys = this.keys()
                .filter(k => k !== key)
                .sort((a, b) => {
                    const d = a.length - b.length;
                    return d > 0 ? -1 : d === 0 ? 0 : 1;
                });
            while (vsize > this.maxSize && keys.length > 0) {
                const delKey = keys[0];
                this.del(delKey);
                keys.splice(0, 1);
        
                vsize = this.getStats().vsize;
        
                // console.log(`DELETED: ${delKey}, MCACHE NEW SIZE: ${Math.round(vsize / 100) / 10}KB, ${keys.length} ELEMS`);
            }

            // t2 = performance.now();
            // console.log(`set perfomance: ${t2 - t1} ms`);
        })
    }
}

module.exports = Cache;
