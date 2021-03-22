import { IConnection, IOptions, RequestOptions, UrlInfo } from "./types/connectionTypes";
import { stringConstants } from "./util/constants/stringConstants";
import { createQueryString } from "./util/index";

export class Connection {
  private _url: string;
  private _agent: Function | string = "fetch";
  private _fabricName: string = "_system";
  private _headers?: { [key: string]: string };
  private _tenantName: string = "_mm";

  constructor(config: IConnection) {
    const { url, fabricName, apiKey, agent, headers } = config;
    this._url = url || "https://gdn.paas.macrometa.io";

    if(agent) {
      this._agent = agent;
    }

    if (fabricName) {
      this._fabricName = fabricName;
    }

    if (headers) {
      this._headers = { ...headers };
    }

    if (apiKey) {
      this._headers = {
        ...this._headers,
        authorization: `apikey ${apiKey}`,
      };
      this._tenantName = this._extractTenantName(apiKey);
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
    const apiUrl = `https://api-${this._url.split("https://")[1]}`;
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

  private _extractTenantName(apiKey: string) {
    let apiKeyArr = apiKey.split(".");
    apiKeyArr.splice(-2, 2);
    return apiKeyArr.join(".");
  }

  getTenantName(): string {
    return this._tenantName;
  }

  getFabricName(): string {
    return this._fabricName;
  }

  private _buildUrl({ absolutePath = false, path, qs }: UrlInfo) {
    let fullPath = this._getUrl;
    if (!absolutePath) {
      fullPath += `/_fabric/${this._fabricName}`;
    }
    if (path) fullPath += path;
    if (qs) {
      if (typeof qs === "string") fullPath += `?${qs}`;
      else fullPath += `?${createQueryString(qs)}`;
    }

    return fullPath;
  }

  request<T = { [key: string]: any }>(
    {
      method = "GET",
      body,
      path,
      qs,
      absolutePath = false
    }: RequestOptions,
    getter?: (error: boolean, res: { [key: string]: any }) => T
  ) {
    const url = this._buildUrl({absolutePath, path, qs});

    return this._getHttpClient()(
      url,
      this._getOptions(method, body)
    ).then(async (response: any) => {
      const result = await response.json();
      const { status } = response;
      const { ERROR_MESSAGE } = stringConstants;

      if (status && (status === 200 || status === 202)) {
        if(getter) {
          getter(false, result);
        }
        return result;
      }
      if (status && status !== 200 && status >= 400) {
        if(getter) {
          getter(true, result);
        }
        throw result;
      }
      const serverErrorRes = { code: 500, errorMessage: ERROR_MESSAGE };
      if(getter) {
        getter(true, serverErrorRes);
      }
      throw serverErrorRes;
    });
  }

}
