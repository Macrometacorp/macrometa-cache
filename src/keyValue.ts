import { Connection } from "./connection";
import { AllKeysOptions } from "./types/connectionTypes";

export type KVPairHandle = {
  _key: string;
  value: any;
  expireAt: number;
}

export class KeyValue {
  private _connection: Connection;
  name: string;

  constructor(connection: Connection, name: string) {
    this._connection = connection;
    this.name = name;
  }

  get() {
    return this._connection.request(
      {
        path: `/_api/collection/${this.name}`
      }
    );
  }

  exists(): Promise<boolean> {
    return this.get().then(
      () => true,
      () => false
    );
  }

  getCollections(cb?: Function) {
    return this._connection.request(
      {
        method: "GET",
        path: "/_api/kv",
      },
      (error, res) => {
        typeof cb === "function" && cb(error, res);
      }
    );
  }

  getKVCount(cb?: Function) {
    return this._connection.request(
      {
        method: "GET",
        path: `/_api/kv/${this.name}/count`,
      },
      (error, res) => {
        typeof cb === "function" && cb(error, res);
      }
    );
  }

  getKVKeys(opts: AllKeysOptions = {}, cb?: Function) {
    const { limit } = opts;
    return this._connection.request(
      {
        method: "GET",
        path: `/_api/kv/${this.name}/keys`,
        qs: { ...opts, limit: !!limit ? limit : 100 }
      },
      (error, res) => {
        typeof cb === "function" && cb(error, res);
      }
    );
  }

  getValueForKey(key: string, cb?: Function) {
    return this._connection.request(
      {
        method: "GET",
        path: `/_api/kv/${this.name}/value/${key}`,
      },
      (error, res) => {
        typeof cb === "function" && cb(error, res);
      }
    );
  }

  createCollection(expiration: boolean = false, cb?: Function) {
    return this._connection.request(
      {
        method: "POST",
        path: `/_api/kv/${this.name}`,
        qs: {
          expiration
        },
      },
      (error, res) => {
        typeof cb === "function" && cb(error, res);
      }
    );
  }

  deleteCollection(cb?: Function) {
    return this._connection.request(
      {
        method: "DELETE",
        path: `/_api/kv/${this.name}`,
      },
      (error, res) => {
        typeof cb === "function" && cb(error, res);
      }
    );
  }

  deleteEntryForKey(key: string, cb?: Function) {
    return this._connection.request(
      {
        method: "DELETE",
        path: `/_api/kv/${this.name}/value/${key}`,
      },
      (error, res) => {
        typeof cb === "function" && cb(error, res);
      }
    );
  }

  deleteEntryForKeys(keys: string[], cb?: Function) {
    return this._connection.request(
      {
        method: "DELETE",
        path: `/_api/kv/${this.name}/values`,
        body: keys
      },
      (error, res) => {
        typeof cb === "function" && cb(error, res);
      }
    );
  }

  insertKVPairs(keyValuePairs: KVPairHandle[], cb?: Function) {
    return this._connection.request(
      {
        method: "PUT",
        path: `/_api/kv/${this.name}/value`,
        body: keyValuePairs
      },
      (error, res) => {
        typeof cb === "function" && cb(error, res);
      }
    );
  }

  truncate(cb?: Function) {
    return this._connection.request(
      {
        method: "PUT",
        path: `/_api/kv/${this.name}/truncate`
      },
      (error, res) => {
        typeof cb === "function" && cb(error, res);
      }
    );
  }
}
