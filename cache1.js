const NodeCache = require('node-cache');

class Cache extends NodeCache {
    // maxSize;
    keysOrdered = [];
    constructor(options) {
        super(options);
        this.maxSize = options?.maxSize ?? 0;

        this.on('set', (key) => {
            // let t1, t2;
            // t1 = performance.now();

            // let insertId = this.keysOrdered.length;
            // for (let i = 0; i < this.keysOrdered.length; i++) {
            //     if (key.length > this.keysOrdered[i].length) {
            //         insertId = i;
            //         break;
            //     }
            // }

            if (this.keysOrdered.findIndex(val => val === key) === -1) {

                let insertId = this.keysOrdered.findIndex(val => key.length > val.length)
                insertId = insertId > 0 ? insertId : this.keysOrdered.length;
                this.keysOrdered.splice(insertId, 0, key);
            }

            // if (maxSize === 0) return;
            let vsize = this.getStats().vsize;
            // console.log(`CACHE SET: ${key}`);
            // console.log(`CACHE size: ${Math.round(vsize / 100) / 10}KB`);
        
            if (vsize <= this.maxSize || this.maxSize === 0) {
                // t2 = performance.now();
                // console.log(`set perfomance: ${t2 - t1} ms`);
                return;
            };
            
            while (vsize > this.maxSize && this.keysOrdered.length > 0) {
                // const idx = Math.floor(Math.random() * keys.length);
                const delKey = this.keysOrdered.shift();
                this.del(delKey);
        
                vsize = this.getStats().vsize;
        
                // console.log(`DELETED: ${delKey}, MCACHE NEW SIZE: ${Math.round(vsize / 100) / 10}KB, ${this.keysOrdered.length} ELEMS`);
            }

            // t2 = performance.now();
            // console.log(`set perfomance: ${t2 - t1} ms`);
        })
    }
}

module.exports = Cache;
