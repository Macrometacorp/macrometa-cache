import { Connection } from "./connection";
import { IConnection, SetResponse, GetResponse, AllKeysOptions } from "./types/connectionTypes";
import { KeyValue } from "./keyValue";
import { SocketConnection } from "./socketConnection";
import { getsortedQueryParamsUrl, sha256 } from "./util/index";

export default class Client extends Connection {

  private _connection: Connection;
  private name: string = "mmcache";
  private ttl: number = 3600;
  private keyValue: KeyValue;
  private socketConnection: SocketConnection;

  constructor(config: IConnection) {
    super(config);

    this._connection = new Connection(config);

    if (config.ttl) {
      this.ttl = config.ttl;
    }

    this.keyValue = new KeyValue(this._connection, this.name);
    this.socketConnection = new SocketConnection(this._connection, this.name);
  }

  getExpireAtTimeStamp(ttl: number) {
    const currDate = new Date();
    currDate.setSeconds(ttl);

    return currDate.getTime() / 1000;
  }

  set(_key: string, value: any, ttl?: number, cb?: Function) {
    if (typeof ttl === "function") {
      cb = ttl;
      ttl = this.ttl;
    }
    const ttlVal = !!ttl ? ttl : this.ttl;
    const expireAt = this.getExpireAtTimeStamp(ttlVal);

    return this.keyValue.insertKVPairs([{
      _key,
      value,
      expireAt
    }], cb)
  }

  get(key: string, cb?: Function): Promise<any> {
    return this.keyValue.getValueForKey(key, cb);
  }

  delete(key: string, cb?: Function) {
    return this.keyValue.deleteEntryForKey(key, cb);
  }

  deleteCache(cb?: Function) {
    return this.keyValue.deleteCollection(cb);
  }

  size(cb?: Function) {
    return this.keyValue.getKVCount(cb);
  }

  async clear(cb?: Function) {
    const count = await this.size();
    const clearData = await this.keyValue.truncate();

    if (clearData.error) {
      if (typeof cb === "function") {
        cb(true, clearData);
      }
      return clearData;
    }
    const res = { ...count, ...clearData };
    if (typeof cb === "function") {
      cb(false, res);
    }
    return res;
  }

  allKeys(opts?: AllKeysOptions, cb?: Function) {
    if (typeof opts === "function") {
      cb = opts;
      opts = {};
    }
    return this.keyValue.getKVKeys(opts, cb);
  }

  setResponse(inputs: SetResponse, cb?: Function) {
    const { url, data, ttl, params } = inputs;
    if (!url) {
      throw "Please provide url";
    }
    const sortedUrl = getsortedQueryParamsUrl(url, params);
    const key = `${sha256(sortedUrl)}`;

    return this.set(key, data, ttl, cb);
  }

  getResponse(inputs: GetResponse, cb?: Function) {
    const { url, params } = inputs;
    if (!url) {
      throw "Please provide url";
    }
    const sortedUrl = getsortedQueryParamsUrl(url, params);
    const key = `${sha256(sortedUrl)}`;

    return this.get(key, cb);
  }

  async onCacheUpdate(
    subscriptionName: string,
    cb?: Function
  ) {
    if (!subscriptionName) {
      throw "Please provide subscription name";
    }
    let setIntervalId: any;
    const self = this;
    const localDcDetails = await this.socketConnection.getLocalEdgeLocation();
    const dcUrl = localDcDetails.tags.url;
    const producerOtp = await this.socketConnection.getOtp();
    const noopProducer = await this.socketConnection.noopProducer(dcUrl, producerOtp);
    const consumerOtp = await this.socketConnection.getOtp();
    const consumer = await this.socketConnection.consumer(subscriptionName, dcUrl, consumerOtp);
    const noopProducerOpenCallback = () => {
      console.log("noop producer opened");
      setIntervalId = setInterval(() => {
        noopProducer.send(JSON.stringify({ payload: 'noop' }));
      }, 30000);
    };
    const closeWSConnection = () => {
      console.log(`Closing WS connection for ${self.name}`);
      setIntervalId && clearInterval(setIntervalId);
    };

    noopProducer.on("open", noopProducerOpenCallback);

    noopProducer.on("close", (e: Event) => console.log("noop producer closed ", e));

    noopProducer.on("error", (e: Event) => console.log("noop producer errored ", e));

    noopProducer.on("message", (msg: string) => console.log('received ack: %s', msg));

    consumer.on("error", () => {
      const errorMessage = `Failed to establish WS connection for ${self.name}`;
      console.log(errorMessage);
      typeof cb === "function" && cb(true, { errorMessage });
    });

    consumer.on("message", (msg: any) => {
      const { messageId, payload } = JSON.parse(msg);
      consumer.send(JSON.stringify({ messageId }));

      if (payload !== "noop") {
        const data = JSON.parse(atob(payload));
        typeof cb === "function" && cb(false, data);
      }
    });

    consumer.on("close", closeWSConnection);

    consumer.on("open", () => {
      console.log(`Connection open for ${self.name}`)
    });
  }

  async create(name?: string, cb?: Function) {
    if (typeof name === "string" && !!name) {
      this.name = name;
    }
    if (typeof name === "function") {
      cb = name;
    }

    this.keyValue = new KeyValue(this._connection, this.name);
    this.socketConnection = new SocketConnection(this._connection, this.name);

    const exist = await this.keyValue.exists();
    if (exist) {
      typeof cb === "function" && cb(false, { status: 200, message: "Cache already exist!!" });
      return { status: 200, message: "Cache already exist!!" };
    }

    return this.keyValue.createCollection(true, cb);
  }

}
