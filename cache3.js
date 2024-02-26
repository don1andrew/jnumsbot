const NodeCache = require('node-cache');

class ChunkedSet {
    constructor() {
        this.chunks = {};
    }
    add = function(key) {
        const chunkId = key.length;
        if (!this.chunks[chunkId]) {
            this.chunks[chunkId] = new Set();
        }
        this.chunks[chunkId].add(key);
    }
    pick = function() {
        const ks = Object.keys(this.chunks);
        for (let i = ks.length - 1; i >= 0; i--) {
            let val = undefined;
            if (val = this.chunks[ks[i]].values().next().value) {
                this.chunks[ks[i]].delete(val);
                return val;
            }
        }
        return;
    }
}


class Cache extends NodeCache {
    constructor(options) {
        super(options);
        this.keyChunks = new ChunkedSet();
        this.maxSize = options?.maxSize ?? 0;

        this.on('set', (key) => {
            this.keyChunks.add(key);

            // if (maxSize === 0) return;
            let vsize = this.getStats().vsize;
            // console.log(`CACHE SET: ${key}`);
            // console.log(`CACHE size: ${Math.round(vsize / 100) / 10}KB`);
        
            if (vsize <= this.maxSize || this.maxSize === 0) {
                return;
            };
            
            let delKey = undefined;
            do {
                delKey = this.keyChunks.pick();
                this.del(delKey);
        
                vsize = this.getStats().vsize;
            } while (vsize > this.maxSize && delKey);

                // console.log(`DELETED: ${delKey}, MCACHE NEW SIZE: ${Math.round(vsize / 100) / 10}KB, ${this.keysOrdered.length} ELEMS`);
        })
    }
}

module.exports = Cache;
