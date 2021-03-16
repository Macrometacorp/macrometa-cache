
import { IConnection } from "./types/connectionTypes";
import Client from "./client";

export default function mmcache(config: IConnection) {
  return new Client(config);
}
