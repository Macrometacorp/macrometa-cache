import { Connection } from "./connection";
import { SocketConnections } from "./types/connectionTypes";
import { createQueryString } from "./util/index";
import { ws } from "./util/webSocket";

export enum StreamConstants {
  PERSISTENT = "persistent",
}

export class SocketConnection {
  private _connection: Connection;
  private name: string;
  private socketConnections: Array<SocketConnections>;

  constructor(
    connection: Connection,
    name: string,
  ) {
    this._connection = connection;
    this.name = name;
    this.socketConnections = [];
  }

  getOtp() {
    return this._connection.request(
      {
        method: "POST",
        path: "/apid/otp",
        absolutePath: true,
      },
      (res: any) => res.otp
    );
  }

  getLocalEdgeLocation() {
    return this._connection.request(
      {
        path: "/datacenter/local",
        absolutePath: true,
      },
      (res: any) => res
    );
  }

  closeAllSocketConnections() {
    for (let conn of this.socketConnections) {
      conn.terminate();
    }

    this.socketConnections = [];
  }

  consumer(
    subscriptionName: string,
    dcName: string,
    params: { [key: string]: any } = {}
  ) {
    const lowerCaseUrl = dcName.toLocaleLowerCase();
    if (lowerCaseUrl.includes("http") || lowerCaseUrl.includes("https"))
      throw "Invalid DC name";

    const persist = StreamConstants.PERSISTENT;
    const region = "c8local";
    const tenant = this._connection.getTenantName();
    const queryParams = createQueryString(params);
    let dbName = this._connection.getFabricName();

    if (!dbName || !tenant)
      throw "Set correct DB and/or tenant name before using.";

    let consumerUrl = `wss://api-${dcName}/_ws/ws/v2/consumer/${persist}/${tenant}/${region}.${dbName}/${
      this.name
      }/${subscriptionName}`;

    // Appending query params to the url
    consumerUrl = `${consumerUrl}?${queryParams}`;
    const consumerConn = ws(consumerUrl);
    this.socketConnections.push(consumerConn);

    return consumerConn;
  }

  noopProducer(
    dcName: string,
    params: { [key: string]: any } = {}
  ) {
    const lowerCaseUrl = dcName.toLocaleLowerCase();
    if (lowerCaseUrl.includes("http") || lowerCaseUrl.includes("https"))
      throw "Invalid DC name";

    const persist = StreamConstants.PERSISTENT;
    const region = "c8local";
    const tenant = this._connection.getTenantName();
    const queryParams = createQueryString(params);
    let dbName = this._connection.getFabricName();

    if (!dbName || !tenant)
      throw "Set correct DB and/or tenant name before using.";

    let noopProducerUrl = `wss://api-${dcName}/_ws/ws/v2/producer/${persist}/${tenant}/${region}.${dbName}/${
      this.name
      }`;

    // Appending query params to the url
    noopProducerUrl = `${noopProducerUrl}?${queryParams}`;
    const noopProducerConn = ws(noopProducerUrl);
    this.socketConnections.push(noopProducerConn);

    return noopProducerConn;
  }
}
