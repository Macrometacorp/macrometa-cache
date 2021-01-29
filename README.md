# mmcache

Low latency persistent global cache library to cache `objects` and `responses` utilizing Macrometa GDN. It is a side cache.

## Installation

```
npm install mmcache
```

## Usage

### Browser
```
TBD
// browser's own caches - ETag, etc
// route based caching - middleware + SSR
// https://redis.io/topics/client-side-caching
// browser direct - API key will be exposed in browser's code
```

### Node
```
var options = {
  url: 'paas.gdn.macrometa.io',
  apikey: 'xxxxxx',
  ttl: number(seconds)
};

// create cache. 
var cache = new mmcache(options);

// or create cache with specific name.
var cache = new mmcache('todo', options);
```

**Notes:**

* `var cache = new mmcache(options);` --> Creates a global KV collection with name `mmcache` if not present.
* `var cache = new mmcache('todo', options);` ---> Creates a global KV collection with name `todo` if not present.

## API

#### mmcache([name], options)

* Create a `default` cache (with name `mmcache`) or a cache with user supplied `name`.
* Default `ttl` value is 3600 seconds.
* **options** is a dictionary of variables to connect to GDN.

```
var options = {
  url: 'paas.gdn.macrometa.io',
  apikey: 'xxxxxx',
  ttl: `seconds` (optional)
};
```

#### cache.set(`key`, `value`, `[ttl]`): Promise

Cache data or update an existing record.

* `key` Unique key identifying the cache entry
* `value` Cached value  
* `ttl` Time to live in seconds (optional). 
  * If ttl is not specified, then this method uses the `ttl` specified in the mmcache() constructor. 
  * If no `ttl` is specified in the mmcache() constructor then default `ttl` value of 3600 seconds (1 hour) will be used.

#### cache.get(`key`, `[callback]`): Promise

Get cached value. Returns cached value (or undefined) if no callback was provided. Always returns undefined if callback argument is present.

* `key` Key identifying the cache entry
* `callback` Return value in callback if record exists (optional)

#### cache.del(`key`): Promise

Delete cached entry. Returns true if the record existed, false if not.

* `key` Key identifying the cache

#### cache.clear(): Promise

Clear all cached data. Returns number of cleared records. Note: The cache itself is not deleted here.

#### cache.deleteCache(): Promise

Deletes the persistent cache.

#### cache.size(): Promise
                
Returns number of cached records.

#### cache.allKeys(): Promise
Returns list of all keys in a given cache.

#### cache.response(url, params)

#### cache.response(req, resp)

Cache the response.

```
const ssrCache = cache.response({
  get: ({ req, res }) => ({
    data: doSomething(req),
    ttl: 7200000 // 2 hours
  }),
  send: ({ data, res, req }) => res.send(data)
})
```

## Links
(Used below to construct above APIs. Links to be removed later.)

* https://github.com/cayasso/cacheman
* https://github.com/dirkbonhomme/js-cache
* https://github.com/kwhitley/apicache
* https://github.com/Kikobeats/cacheable-response



## Comments...

* For response caching, use. `Cache-key = HASH( url, SORT(params))`. 
  * Reason - this is a geo-replicated cache and should handle even if params are in different order. So the sort will help here.
* The cache should work in NodeJS, Workers (CF Workers, Edge Workers) and Browser.

