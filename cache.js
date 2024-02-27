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

function getSize(cache) {
    const stats = cache.getStats();
    return stats.vsize + stats.ksize * 2;
}

class Cache extends NodeCache {
    constructor(options) {
        super(options);
        this.keyChunks = new ChunkedSet();
        this.maxSize = options?.maxSize ?? 0;

        this.on('set', (key) => {
            this.keyChunks.add(key);

            let vsize = getSize(this);
        
            if (vsize <= this.maxSize || this.maxSize === 0) {
                return;
            };
            
            let delKey = undefined;
            do {
                delKey = this.keyChunks.pick();
                this.del(delKey);
                
                vsize = getSize(this);
            } while (vsize > this.maxSize && delKey);
        })
    }
}

module.exports = Cache;
