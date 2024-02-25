const NodeCache = require('node-cache');

function addOrdered(array, value) {

}
function binFindIndex (arr, x) {
    let start = 0, end = arr.length - 1;
 
    // Iterate while start not meets end
    while (start <= end) {
        // Find the mid index
        let mid = Math.floor((start + end) / 2);
 
        // If element is present at 
        // mid, return True
        if (arr[mid] === x) return true;
 
        // Else look in left or 
        // right half accordingly
        else if (arr[mid] < x)
            start = mid + 1;
        else
            end = mid - 1;
    }
 
    return false;
}
class OrderedChunks {
    constructor() {
        this.chunks = {};
    }
    add = function(key) {
        const kl = key.length;
        if (!this.chunks[kl]) {
            this.chunks[kl] = [];
        }
        if (!binFindIndex(this.chunks[kl], key)) {
            let insertId = this.chunks[kl].findIndex(val => key < val)
            insertId = insertId >= 0 ? insertId : this.chunks[kl].length;
            this.chunks[kl].splice(insertId, 0, key);
        }
    }
    pick = function() {
        const ks = Object.keys(this.chunks);
        for (let i = ks.length - 1; i >= 0; i--) {
            if (this.chunks[ks[i]].length > 0) {
                return this.chunks[ks[i]].pop();
            }
        }
        return;
    }
}


class Cache extends NodeCache {
    // maxSize;
    keyChunks = new OrderedChunks();
    constructor(options) {
        super(options);
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
            
            while (vsize > this.maxSize && this.keysOrdered.length > 0) {
                const delKey = this.keyChunks.pick();
                this.del(delKey);
        
                vsize = this.getStats().vsize;
        
                // console.log(`DELETED: ${delKey}, MCACHE NEW SIZE: ${Math.round(vsize / 100) / 10}KB, ${this.keysOrdered.length} ELEMS`);
            }
        })
    }
}

module.exports = Cache;
