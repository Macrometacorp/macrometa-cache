import { ConnectOptions } from "./types/connectionTypes";
import { RetryOperations } from "./types/connectionTypes";
const retry = require("retry");

export default class RetryConn {
  private retryOperations: Array<RetryOperations>;

  constructor() {
    this.retryOperations = [];
  }

  operation(config: ConnectOptions) {
    const retryOperation = retry.operation(config);
    this.retryOperations.push(retryOperation);

    return retryOperation;
  }

  stopAlloperations() {
    for (let retry of this.retryOperations) {
      retry.stop();
    }

    this.retryOperations = [];
  }
}
