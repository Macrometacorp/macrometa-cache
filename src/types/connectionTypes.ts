export interface IConnection {
  url: string;
  apiKey: string;
  agent: Function | string;
  fabricName?: string;
  ttl?: number;
  absolutePath?: boolean;
  headers?: { [key: string]: string };
};

export interface IOptions {
  method: string;
  headers: { [key: string]: string };
  body: string;
  path?: string;
  qs?: string | { [key: string]: any };
};

export interface RequestOptions {
  method?: string;
  body?: any;
  path?: string;
  qs?: { [key: string]: any };
  absolutePath?: boolean;
};

export interface SetResponse {
  url: string;
  data: any;
  params?: { [key: string]: any };
  ttl?: number;
};

export interface GetResponse {
  url: string;
  params?: { [key: string]: any };
};

export interface UrlInfo {
  absolutePath?: boolean;
  path?: string;
  qs?: string | { [key: string]: any };
};

export interface AllKeysOptions {
  offset?: number;
  limit?: number;
  order?: string;
};

export interface ConnectOptions {
  keepAlive?: boolean;
  sendNoopDelay?: number;
  retries?: number;
  factor?: number;
  minTimeout?: number;
  maxTimeout?: number;
  randomize?: number | boolean;
  forever?: boolean;
};

export type SocketConnections = {
  terminate: Function
}

export type RetryOperations = {
  stop: Function,
}
