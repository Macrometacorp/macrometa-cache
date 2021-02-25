export interface IConnection {
  url: string;
  apiKey: string;
  agent: Function | string;
  name?: string;
  fabric?: string;
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
};
export interface SetResponse {
  url: string;
  res: any;
  params?: { [key: string]: any };
  ttl?: number;
};
export interface GetResponse {
  url: string;
  params?: { [key: string]: any };
};
