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
const mmcache = require('mmcache');
var options = {
  url: string;
  apiKey: string;
  agent: Function | string;
  name: string; // (optional) If Collection is already created you can pass the name here.
  fabric: string; // (optional)
  ttl: number; // (optional)
  absolutePath: boolean; // (optional)
  headers: { [key: string]: string }; // (optional)
};

// create cache. 
var cache = new mmcache(options);

```

**Notes:**

* ```
  import mmcache from 'mmcache'; 
  var cache = new mmcache(options);
  awiat cache.create(); // Creates a global KV collection with name passed in options. if not passed it creates with name `mmcache`.
  ```

## API

#### mmcache(options)

* **options** is a dictionary of variables to connect to GDN and default values for KV collection.

```
var options = {
  url: 'paas.gdn.macrometa.io',
  apikey: 'xxxxxx',
  agent: 'fetch',
  ttl: 3600
};
```

#### cache.create(): Promise

Creates a global KV collection with name passed in options. if not passed it creates with name `mmcache`.

#### cache.set(`key`, `value`, `[ttl]`): Promise

Cache data or update an existing record.

* `key` Unique key identifying the cache entry
* `value` Cached value  
* `ttl` Time to live in seconds (optional). 
  * If ttl is not specified, then this method uses the `ttl` specified in the mmcache() constructor. 
  * If no `ttl` is specified in the mmcache() constructor then default `ttl` value of 3600 seconds (1 hour) will be used.

#### cache.get(`key`): Promise

Returns cached value.

* `key` Key identifying the cache entry

#### cache.delete(`key`): Promise

Delete cached entry.

* `key` Key identifying the cache

#### cache.clear(): Promise

Clear all cached data. Returns number of cleared records. Note: The cache itself is not deleted here.

#### cache.deleteCache(): Promise

Deletes the persistent cache.

#### cache.size(): Promise
                
Returns number of cached records.

#### cache.allKeys(): Promise

Returns list of all keys in a given cache.

#### cache.setResponse(url, value, [ttl]): Promise

Cache api response or update an existing record.

* `url` Api url
* `value` response to be stored
* `ttl` time to live in seconds (optional)

#### cache.getResponse(url): Promise

* `url` Api url

Returns cached response.


