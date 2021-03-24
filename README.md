# mmcache

Low latency persistent global side cache library to cache `objects` and `responses` utilizing Macrometa GDN.

## Installation

``` bash
$ npm install mmcache
```

## Usage

```javascript
import mmcache from "macrometa-cache"; // Browser
// OR
const mmcache = require('macrometa-cache'); // Node


// Initialize
const cache = new mmcache({
  url: "https://gdn.paas.macrometa.io",
  apiKey: "XXXX",
});
await cache.create(); // This step is required to create cache in GDN.
// OR

const cache = new mmcache({
  url: "https://gdn.paas.macrometa.io",
  apiKey: "XXXX",
  ttl: 120
});
await cache.create("sampleCache");


// Set the value
cache.set('cacheKey', { foo: 'bar' }, 120, function (error, data) {

  if (error) throw data.errorMessage;

  // get the value
  cache.get('cacheKey', function (error, data) {

    if (error) throw data.errorMessage;

    console.log(data.value); //-> { foo: "bar" }

    // delete entry
    cache.delete('cacheKey', function (error, data){

      if (error) throw data.errorMessage;

      console.log('value deleted');
    });

  });
});
```

## API

### mmcache(options)

  **options** is a dictionary of variables to connect to GDN and default values for KV collection.

  * `url` (String) GDN url. Default is `https://gdn.paas.macrometa.io`
  * `apiKey` (String) api key.
  * `agent` (String | Function) Agent to be used. Default is `fetch`.
  * `fabricName` (String) (optional) Name of the fabric. Default is `_system`.
  * `ttl` (Number) (optional) Time to live in seconds. -1 means no expiration. Default is `3600 seconds`.
  * `absolutePath` (Boolean) (optional) If absolute path needs to be used. Default is `false`.
  * `headers` (Object) (optional) If extra headers need to be provided.

  ```javascript
  const options = {
    url: "https://gdn.paas.macrometa.io";
    apiKey: "XXXX";
    agent: "fetch";
    fabricName: "_system";
    ttl: 3600;
  };

  const cache = new mmcache(options);
  ```

### cache.create([name], [callback]): Promise

  Creates a global KV collection with given name. if not provided it creates with name `mmcache`.

  :bulb: **Note:** This step is must after initializing mmcache to create cache in GDN. Skip this step if cache is already created.

  - **name**: `String` (optional)

    Name of the KV collection

  ```javascript
  const cache = new mmcache({
    url: "https://gdn.paas.macrometa.io",
    apiKey: "XXXX",
  });

  await cache.create();
  //OR

  cache.create((error, data) => {
    if (error) throw data.errorMessage;
  });
  // OR

  cache.create("myCache", (error, data) => {
    if (error) throw data.errorMessage;
  });
  ```

### cache.set(`key`, `value`, `[ttl]`, `[callback]`): Promise

  Cache data or update an existing record.

  - **key**: `String`

    Unique key identifying the cache entry

  - **value**: `Any`

    Value to be Cached.

  - **ttl**: `Number` Time to live in seconds (optional)

    * If ttl is not specified, then this method uses the `ttl` specified in the mmcache() constructor. 
    * If no `ttl` is specified in the mmcache() constructor then default `ttl` value of 3600 seconds (1 hour) will be used.
    * -1 means no expiration.

  ```javascript
  const cache = new mmcache({
    url: "https://gdn.paas.macrometa.io",
    apiKey: "XXXX",
  });

  await cache.create();

  cache.set('cacheKey', { foo: 'bar' }, 120, function (error, data) {

    if (error) throw data.errorMessage;

    // do something
  });
  // OR

  cache.set('cacheKey', { foo: 'bar' }, function (error, data) { // Without ttl

    if (error) throw data.errorMessage;

    // do something
  });
  ```

### cache.get(`key`, `[callback]`): Promise

  Returns cached value of given key.

  - **key**: `String`

    Unique key identifying the cache entry

  ```javascript
  const cache = new mmcache({
    url: "https://gdn.paas.macrometa.io",
    apiKey: "XXXX",
  });

  await cache.create();

  cache.get('cacheKey', function (error, data) {

    if (error) throw data.errorMessage;

    console.log(data.value); //-> { foo: "bar" }
  });
  ```

### cache.delete(`key`, `[callback]`): Promise

  Delete cached entry.

  - **key**: `String`

    Unique key identifying the cache entry
    
  ```javascript
  const cache = new mmcache({
    url: "https://gdn.paas.macrometa.io",
    apiKey: "XXXX",
  });

  await cache.create();

  cache.delete('cacheKey', function (error, data){

    if (error) throw data.errorMessage;

    console.log('value deleted');
  });
  ```

### cache.clear(`[callback]`): Promise

  Clears all cached data. Returns number of cleared records.

  :bulb: **Note:** The cache itself is not deleted here.

  ```javascript
  const cache = new mmcache({
    url: "https://gdn.paas.macrometa.io",
    apiKey: "XXXX",
  });

  await cache.create();

  cache.clear((error, data) => {

    if (error) throw data.errorMessage;

    console.log(data.count); // number of cleared records.
  });
  ```

### cache.deleteCache(`[callback]`): Promise

  Deletes the persistent cache.

  ```javascript
  const cache = new mmcache({
    url: "https://gdn.paas.macrometa.io",
    apiKey: "XXXX",
  });

  await cache.create();

  cache.deleteCache((error, data) => {

    if (error) throw data.errorMessage;

    console.log('cache deleted');
  });
  ```

### cache.size(`[callback]`): Promise
                
  Returns number of cached records.

  ```javascript
  const cache = new mmcache({
    url: "https://gdn.paas.macrometa.io",
    apiKey: "XXXX",
  });

  await cache.create();

  cache.size((error, data) => {

    if (error) throw data.errorMessage;

    console.log(data.count); // number of cached records.
  });
  ```

### cache.allKeys(`[opts]`, `[callback]`): Promise

  Returns list of all keys in a given cache.

  - **opts**: `Object` (optional) is a JS object that can contain any of the following keys:

    - **offset**: `String`

      This option can be used to simulate paging. Default 0

    - **limit**: `String`

      This option can be used to simulate paging. Limit the result. Default 100, max 100

    - **order**: `String`

      Order the results asc or desc. Default asc

  ```javascript
  const cache = new mmcache({
    url: "https://gdn.paas.macrometa.io",
    apiKey: "XXXX",
  });

  await cache.create();

  cache.allKeys({offset: 100, limit: 4, order: "desc"}, (error, data) => {

    if (error) throw data.errorMessage;

    console.log(data); // returns 4 records after 100 with descending order
  });
  ```

### cache.setResponse(`inputs`, `[callback]`): Promise

  Cache api response or update an existing record.

  - **inputs**: `Object` is a JS object that can contain any of the following keys:

    - **url**: `String`

      Api url string.

    - **data**: `Any`

      response to be cached.

    - **ttl**: `Number` (optional)

      time to live in seconds. -1 means no expiration.

    - **params**: `Object` (optional)

      Any extra params or request body

  ```javascript
  const cache = new mmcache({
    url: "https://gdn.paas.macrometa.io",
    apiKey: "XXXX",
  });

  await cache.create();

  cache.setResponse({ url: "http://dummy.restapiexample.com/api/v1/update?qs=123", data: { foo: 'bar' }, ttl: 120}, (error, data) => {
    
    if (error) throw data.errorMessage;

    // do something
  });
  ```

### cache.getResponse(`inputs`, `[callback]`): Promise

  Returns cached response.

  - **inputs**: `Object` is a JS object that can contain any of the following keys:

    - **url**: `String`

      Api url string.

    - **params**: `Object` (optional)

      Any extra params or request body

  ```javascript
  const cache = new mmcache({
    url: "https://gdn.paas.macrometa.io",
    apiKey: "XXXX",
  });

  await cache.create();

  cache.getResponse({url: "http://dummy.restapiexample.com/api/v1/update?qs=123"}, (error, data) => {
      
    if (error) throw data.errorMessage;

    console.log(data.value) // { foo: 'bar' }
  });
  ```

### cache.onCacheUpdate(`subscriptionName`, [`opts`], [`callback`]):

  Returns updated data with key and value in callback for defined KV collection.
  
  :bulb: **Note:** Usage of this api requires websocket support.

  - **subscriptionName**: `string` (optional)

    The name of the subscription.

  - **opts**: `Object` (optional) is a JS object that can contain any of the following keys:

    - **keepAlive**: This will send noop message after every `sendNoopDelay` to keep connection alive if provided `true`. Default is `false`.

        :bulb: **Note:** noop basically a dummy message called no operation.
    - **sendNoopDelay**: The number of milliseconds after which noop message will be sent. default is `30000`.
    - **retries**: The maximum amount of times to retry the operation. Default is `10`. Seting this to `1` means `do it once, then retry it once`.
    - **factor**: The exponential factor to use. Default is `2`.
    - **minTimeout**: The number of milliseconds before starting the first retry. Default is `1000`.
    - **maxTimeout**: The maximum number of milliseconds between two retries. Default is `Infinity`.
    - **randomize**: Randomizes the timeouts by multiplying with a factor between `1` to `2`. Default is `false`.
    - **forever**: Whether to retry forever, defaults to `false`.

  ```javascript
  const cache = new mmcache({
    url: "https://gdn.paas.macrometa.io",
    apiKey: "XXXX",
  });

  await cache.create();

  cache.onCacheUpdate("my-sub", { retries: 2 }, (error, data) => {
        
    if (error) throw data.errorMessage;

    console.log(data);
  });
  ```
