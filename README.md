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
```

### Node
```
var options = {
  url: 'paas.gdn.macrometa.io',
  apikey: 'xxxxxx'
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

### mmcache([name], options)

Create a `default` cache or a cache with given `name`. **options** is a dictionary of variables to connect to GDN.

```
var options = {
  url: 'paas.gdn.macrometa.io',
  apikey: 'xxxxxx'
};
```

### cache.set(`key`, `value`, `[ttl]`)

Cache data or update an existing record.

* `key` Unique key identifying the cache entry
* `value` Cached value  
* `ttl` Time to live in seconds (optional) 

### cache.get(`key`, `[callback]`)

Get cached value. Returns cached value (or undefined) if no callback was provided. Always returns undefined if callback argument is present.

* `key` Key identifying the cache entry
* `callback` Return value in callback if record exists (optional)

### cache.del(`key`)

Delete cached entry. Returns true if the record existed, false if not.

* `key` Key identifying the cache

### cache.clear()

Clear all cached data. Returns number of cleared records.

### cache.size()
                
Returns number of cached records.

### cache.keys(limit, offset)

Returns list of keys in a given cache. At a time only 100 (or is it 1000?) keys are returned.

### cache.response(req, resp)

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




