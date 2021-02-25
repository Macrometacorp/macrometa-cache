import { Connection } from "./connection";

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

  getCollections() {
    return this._connection.request(
      {
        method: "GET",
        path: "/_api/kv",
      }
    );
  }

  getKVCount() {
    return this._connection.request(
      {
        method: "GET",
        path: `/_api/kv/${this.name}/count`,
      }
    );
  }

  getKVKeys(opts: any = {}) {
    return this._connection.request(
      {
        method: "GET",
        path: `/_api/kv/${this.name}/keys`,
        qs: { ...opts }
      }
    );
  }

  getValueForKey(key: string) {
    return this._connection.request(
      {
        method: "GET",
        path: `/_api/kv/${this.name}/value/${key}`,
      }
    );
  }

  createCollection(expiration: boolean = false) {
    return this._connection.request(
      {
        method: "POST",
        path: `/_api/kv/${this.name}`,
        qs: {
          expiration
        },
      }
    );
  }

  deleteCollection() {
    return this._connection.request(
      {
        method: "DELETE",
        path: `/_api/kv/${this.name}`,
      }
    );
  }

  deleteEntryForKey(key: string) {
    return this._connection.request(
      {
        method: "DELETE",
        path: `/_api/kv/${this.name}/value/${key}`,
      }
    );
  }

  deleteEntryForKeys(keys: string[]) {
    return this._connection.request(
      {
        method: "DELETE",
        path: `/_api/kv/${this.name}/values`,
        body: keys
      }
    );
  }

  insertKVPairs(keyValuePairs: KVPairHandle[]) {
    return this._connection.request(
      {
        method: "PUT",
        path: `/_api/kv/${this.name}/value`,
        body: keyValuePairs
      }
    );
  }

  truncate() {
    return this._connection.request(
      {
        method: "PUT",
        path: `/_api/kv/${this.name}/truncate`
      }
    );
  }
}
