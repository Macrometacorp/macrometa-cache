import { connectOptions } from "./types/connectionTypes";
const retry = require("retry");

export default class RetryConn {
  private retryOperation: any;
  private retry: any;

  constructor() {
    this.retryOperation = [];
  }

  operation(config: connectOptions) {
    this.retry = retry.operation(config);
    this.retryOperation.push(this.retry);

    return this.retry;
  }

  stopAlloperations() {
    for (let retry of this.retryOperation) {
      retry.stop();
    }
    
    this.retryOperation = [];
  }
}
