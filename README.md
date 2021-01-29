# Assuming cache aside?

# mmcache

Low latency persistent global cache library to cache `objects` and `responses` utilizing Macrometa GDN.

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
  defaultTTL?: number(time)
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

#### mmcache([name], [TTL], options)

Create a `default` cache or a cache with given `name`. **options** is a dictionary of variables to connect to GDN.

```
var options = {
  url: 'paas.gdn.macrometa.io',
  apikey: 'xxxxxx',
  defaultTTL?: number(time)
};
```

#### cache.set(`key`, `value`, `[ttl]`): Promise

Cache data or update an existing record.

* `key` Unique key identifying the cache entry
* `value` Cached value  
* `ttl` Time to live in seconds (optional) . Takes `defaultTTL` if not provided

#### cache.get(`key`, `[callback]`): Promise

Get cached value. Returns cached value (or undefined) if no callback was provided. Always returns undefined if callback argument is present.

* `key` Key identifying the cache entry
* `callback` Return value in callback if record exists (optional)

#### cache.del(`key`): Promise

Delete cached entry. Returns true if the record existed, false if not.

* `key` Key identifying the cache

#### cache.clear(): Promise

Clear all cached data. Returns number of cleared records.

#### cache.size(): Promise
                
Returns number of cached records.

#### cache.keys(limit, offset): Promise

Returns list of keys in a given cache. At a time only 100 (or is it 1000?) keys are returned.

#### cache.allKeys(): Promise
Returns list of all keys in a given cache.

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

* User should be able to specify default TTL when they create cache. This way, user doesn’t have to specify TTL mandatorily for every set(...) api call.
