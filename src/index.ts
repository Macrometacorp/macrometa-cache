import { Connection } from "./connection";
import { IConnection } from "./types/connectionTypes";
import { KeyValue } from "./keyValue";
import { sortParamsString, getsortedQueryParamsUrl, sha256 } from "./util/index";

export default class MMCache extends Connection {

  private _connection: Connection;
  private name: string = "mmcache";
  private ttl: number = 3600;
  private keyValue: KeyValue;

  constructor(config: IConnection) {
    super(config);

    this._connection = new Connection(config);

    if (config.name) {
      this.name = config.name;
    }

    if (config.ttl) {
      this.ttl = config.ttl;
    }

    this.keyValue = new KeyValue(this._connection, this.name);
  }

  getExpireAtTimeStamp(ttl?: number) {
    const ttlVal = !!ttl ? ttl : this.ttl;
    const currDate = new Date();
    currDate.setSeconds(ttlVal);

    return currDate.getTime() / 1000;
  }

  set(_key: string, value: any, ttl?: number) {
    const expireAt = this.getExpireAtTimeStamp(ttl);

    return this.keyValue.insertKVPairs([{
      _key,
      value,
      expireAt
    }])
  }

  get(key: string): Promise<any> {
    return this.keyValue.getValueForKey(key).then(
      (data: any) => data,
      () => false
    );;
  }

  delete(key: string) {
    return this.keyValue.deleteEntryForKey(key);
  }

  deleteCache() {
    return this.keyValue.deleteCollection();
  }

  size() {
    return this.keyValue.getKVCount();
  }

  async clear() {
    const count = await this.size();
    const clearData = await this.keyValue.truncate();

    if (clearData.error) {
      return clearData;
    }
    return { ...count, ...clearData };
  }

  allKeys() {
    return this.keyValue.getKVKeys();
  }

  setResponse(url: string, value: any, ttl?: number) {
    const params = getsortedQueryParamsUrl(url);
    const sortedParams = sortParamsString(params);
    const key = `${sha256(`${url}${sortedParams}`)}`;

    return this.set(key, value, ttl);
  }

  getResponse(url: string) {
    const params = getsortedQueryParamsUrl(url);
    const sortedParams = sortParamsString(params);
    const key = `${sha256(`${url}${sortedParams}`)}`;

    return this.get(key);
  }

  create() {
    const exist = this.keyValue.exists();
    if (exist) {
      return { status: 200, message: "Cache already exist!!" }
    }
    return this.keyValue.createCollection(true);
  }

}
