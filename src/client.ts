import { Connection } from "./connection";
import { IConnection, SetResponse, GetResponse, AllKeysOptions, ConnectOptions } from "./types/connectionTypes";
import { KeyValue } from "./keyValue";
import { SocketConnection } from "./socketConnection";
import { getsortedQueryParamsUrl, sha256 } from "./util/index";
import Retry from "./retry";

export default class Client extends Connection {

  private _connection: Connection;
  private name: string = "mmcache";
  private ttl: number = 3600;
  private keyValue: KeyValue;
  private socketConnection: SocketConnection;
  private retry: Retry;

  constructor(config: IConnection) {
    super(config);

    this._connection = new Connection(config);

    if (config.ttl) {
      this.ttl = config.ttl;
    }

    this.keyValue = new KeyValue(this._connection, this.name);
    this.socketConnection = new SocketConnection(this._connection, this.name);
    this.retry = new Retry();
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
      (typeof cb === "function") && cb(true, clearData);
      return clearData;
    }
    const res = { ...count, ...clearData };
    (typeof cb === "function") && cb(false, res);

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

  closeAllConnections() {
    this.retry.stopAlloperations();
    this.socketConnection.closeAllSocketConnections();
  }

  onCacheUpdate(
    subscriptionName: string,
    cb: Function,
    opts: ConnectOptions = {},
  ) {
    if (!subscriptionName) {
      throw "Please provide subscription name";
    }

    const {
      keepAlive = false,
      sendNoopDelay = 30000,
      retries = 10,
      factor = 2,
      minTimeout = 1000,
      maxTimeout = Infinity,
      randomize = false,
      forever = false,
    } = opts;

    const retryOperation = this.retry.operation({
      retries,
      factor,
      minTimeout,
      maxTimeout,
      randomize,
      forever,
    });

    const wsConnAttempt = async (currentAttempt: number) => {
      let setIntervalId: ReturnType<typeof setInterval>;
      const self = this;
      const localDcDetails = await this.socketConnection.getLocalEdgeLocation();
      const dcUrl = localDcDetails.tags.url;
      const consumerOtp = await this.socketConnection.getOtp();
      const consumer = await this.socketConnection.consumer(subscriptionName, dcUrl, consumerOtp);
      if (keepAlive) {
        const producerOtp = await this.socketConnection.getOtp();
        const noopProducer = await this.socketConnection.noopProducer(dcUrl, { ...producerOtp, sendTimeoutMillis: sendNoopDelay });
        const noopProducerOpenCallback = () => {
          setIntervalId = setInterval(() => {
            noopProducer.send(JSON.stringify({ payload: 'noop' }));
          }, sendNoopDelay);
        };

        noopProducer.on("open", noopProducerOpenCallback);

        noopProducer.on("close", () => {
          setIntervalId && clearInterval(setIntervalId);
        });

        noopProducer.on("error", () => {
          setIntervalId && clearInterval(setIntervalId);
        });
      }

      const retryAttempt = () => {
        if (retryOperation.retry("Retry connecting")) {
          (typeof cb === "function") && cb(true, { retry: true, errorMessage: `Retry connecting ${self.name}: Attempt ${currentAttempt}` });
          return;
        } else {
          (typeof cb === "function") && cb(true, { retry: false, errorMessage: "All retries failed. Connection closed!!" });
        }
      }

      const closeWSConnection = () => {
        setIntervalId && clearInterval(setIntervalId);
        retryAttempt();
      };

      consumer.on("error", () => {
        retryAttempt();
      });

      consumer.on("message", (msg: string) => {
        const { messageId, payload } = JSON.parse(msg);
        consumer.send(JSON.stringify({ messageId }));

        if (payload !== "noop") {
          const data = JSON.parse(atob(payload));
          (typeof cb === "function") && cb(false, data);
        }
      });

      consumer.on("close", closeWSConnection);
    }

    retryOperation.attempt(wsConnAttempt);
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
      const response = { error: true, errorMessage: `${this.name} already exist!!` };
      (typeof cb === "function") && cb(true, response);
      return response;
    }

    return this.keyValue.createCollection(true, cb);
  }
}
