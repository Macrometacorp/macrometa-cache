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

const options = {
  url: string;
  apiKey: string;
  agent: Function | string;
  name: string; // (optional) If Collection is already created you can pass the name here.
  fabric: string; // (optional)
  ttl: number; // (optional)
  absolutePath: boolean; // (optional)
  headers: { [key: string]: string }; // (optional)
};

// create cache instance. 
const cache = new mmcache(options);

awiat cache.create(); // Creates a global KV collection with name passed in options.
//if not passed it creates with name `mmcache`.

```

**Notes:**

```
import mmcache from 'mmcache'; 

const cache = new mmcache(options);

awiat cache.create(); // Creates a global KV collection with name passed in options.
//if not passed it creates with name `mmcache`.
```

## API

#### mmcache(options)

* **options** is a dictionary of variables to connect to GDN and default values for KV collection.

* `url` (String) Federation url
* `apiKey` (String) api key 
* `agent` (String | Function) agent to be used. ofr example `fetch`.
* `name` (String) (optional) name of the cache. Deafult is `mmcache`.
* `fabric` (String) (optional) name of the fabric. Default is `_system`.
* `ttl` (Number) (optional) Time to live in seconds. Default is `3600 seconds`.
* `absolutePath` (Boolean) (optional) If absolute path needs to be used. Default is `false`.
* `headers` (Object) (optional) If extra headers need to be passed.

```
const options = {
  url: string;
  apiKey: string;
  agent: Function | string;
  name: string; // (optional) If Collection is already created you can pass the name here.
  fabric: string; // (optional)
  ttl: number; // (optional)
  absolutePath: boolean; // (optional)
  headers: { [key: string]: string }; // (optional)
};
```

#### cache.create(): Promise

Creates a global KV collection with name passed in options. if not passed it creates with name `mmcache`.

#### cache.set(`key`, `value`, `[ttl]`): Promise

Cache data or update an existing record.

* `key` (string) Unique key identifying the cache entry
* `value` (Any) Cached value  
* `ttl` (Number) Time to live in seconds (optional). 
  * If ttl is not specified, then this method uses the `ttl` specified in the mmcache() constructor. 
  * If no `ttl` is specified in the mmcache() constructor then default `ttl` value of 3600 seconds (1 hour) will be used.

#### cache.get(`key`): Promise

Returns cached value.

* `key` (string) Key identifying the cache entry

#### cache.delete(`key`): Promise

Delete cached entry.

* `key` (string) Key identifying the cache

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

* `url` (string) Api url
* `value` (Any) response to be stored
* `ttl` (Number) time to live in seconds (optional)

#### cache.getResponse(url): Promise

* `url` (string) Api url

Returns cached response.


