import { remove } from "lodash-es";
import { JSONSourceConnector } from "./json-source-connector";

class ConnectorsManager {
  protected connectors: { connector: any; id: string }[];

  constructor() {
    this.connectors = [];
  }

  addConnector(id: string, connector: any) {
    this.connectors.push({ id, connector });
  }

  getConnector(id: string) {
    return this.connectors.find((conn) => conn.id === id)?.connector;
  }

  remove(id: string) {
    remove(this.connectors, (conn) => {
      return conn.id === id;
    });
  }
}

const connectorManager = new ConnectorsManager();

export function getOrCreateConnectorById(
  objectId: string
): JSONSourceConnector {
  let conn = connectorManager.getConnector(objectId);

  if (conn) return conn;

  conn = new JSONSourceConnector();
  connectorManager.addConnector(objectId, conn);
  return conn;
}
