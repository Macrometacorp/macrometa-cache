import { IConnection, IOptions, RequestOptions } from "./types/connectionTypes";
import { stringConstants } from "./util/constants/stringConstants";

export class Connection {
  private _url: string;
  private _apiKey: string;
  private _agent: Function | string;
  private _fabric?: string = "_system";
  private _absolutePath?: boolean = false;
  private _headers?: { [key: string]: string };

  constructor(config: IConnection) {
    const { url, fabric, apiKey, absolutePath, agent, headers } = config;
    this._url = url;
    this._apiKey = apiKey;
    this._agent = agent;

    if (fabric) {
      this._fabric = fabric;
    }

    if (absolutePath) {
      this._absolutePath = absolutePath;
    }

    if (headers) {
      this._headers = { ...headers };
    }

    if (apiKey) {
      this._headers = {
        ...this._headers,
        authorization: `apikey ${this._apiKey}`,
      };
    }

  }

  private _getHttpClient() {
    if (typeof this._agent === "function") {
      return this._agent;
    }
    if (!globalThis || typeof globalThis !== "object") {
      throw new Error("globalThis needs to be present in the runtime");
    }

    return (globalThis as { [key: string]: any })[this._agent];
  }

  private get _getUrl() {
    let apiUrl = this._url;

    if (!this._absolutePath) {
      apiUrl = `https://api-${apiUrl.split("https://")[1]}`;

      if (!!this._fabric) {
        apiUrl += `/_fabric/${this._fabric}`;
      }
    }
    return apiUrl;
  }

  private _getOptions(
    method: string,
    body: object
  ): IOptions {
    let options: IOptions = {
      method,
      headers: { ...this._headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    };
    return options;
  }

  request({
    method = "GET",
    body,
    path,
    qs
  }: RequestOptions) {
    let url = `${this._getUrl}${path}`;
    let params = '';

    if (qs) {
      if (typeof qs === "string") params = `?${qs}`;
      else params = `?${(new URLSearchParams(qs).toString())}`;
    }

    url += params;

    return this._getHttpClient()(
      url,
      this._getOptions(method, body)
    ).then(async (response: any) => {
      const result = await response.json();
      const { status } = response;
      const { ERROR_MESSAGE } = stringConstants;

      if (status && (status === 200 || status === 202)) {
        return result;
      }
      if (status && status !== 200 && status >= 400) {
        throw result;
      }
      throw { code: 500, errorMessage: ERROR_MESSAGE };
    });
  }

}
