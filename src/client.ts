import { Connection } from "./connection";
import {
  IConnection,
  SetResponse,
  GetResponse,
  AllKeysOptions,
} from "./types/connectionTypes";
import { KeyValue } from "./keyValue";
import { getsortedQueryParamsUrl, sha256 } from "./util/index";

export default class Client extends Connection {
  private _connection: Connection;
  private name: string = "mmcache";
  private ttl: number = 3600;
  private keyValue: KeyValue;

  constructor(config: IConnection) {
    super(config);

    this._connection = new Connection(config);

    if (config.ttl) {
      this.ttl = config.ttl;
    }
    if (config.name) {
      this.name = config.name;
    }

    this.keyValue = new KeyValue(this._connection, this.name);
  }

  getExpireAtTimeStamp(ttl: number) {
    const currDate = new Date();
    currDate.setSeconds(currDate.getSeconds() + ttl);

    return currDate.getTime() / 1000;
  }

  set(_key: string, value: any, ttl?: number, cb?: Function) {
    if (typeof ttl === "function") {
      cb = ttl;
      ttl = this.ttl;
    }
    const ttlVal = !!ttl ? ttl : this.ttl;
    const expireAt = ttlVal === -1 ? -1 : this.getExpireAtTimeStamp(ttlVal);

    return this.keyValue.insertKVPairs(
      [
        {
          _key,
          value,
          expireAt,
        },
      ],
      cb
    );
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
      typeof cb === "function" && cb(true, clearData);
      return clearData;
    }
    const res = { ...count, ...clearData };
    typeof cb === "function" && cb(false, res);

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

  async create(name?: string, cb?: Function) {
    if (typeof name === "string" && !!name) {
      this.name = name;
    }
    if (typeof name === "function") {
      cb = name;
    }

    this.keyValue = new KeyValue(this._connection, this.name);

    const exist = await this.keyValue.exists();
    if (exist) {
      const response = {
        error: true,
        errorMessage: `${this.name} already exist!!`,
      };
      typeof cb === "function" && cb(true, response);
      return response;
    }

    return this.keyValue.createCollection(true, cb);
  }
}
