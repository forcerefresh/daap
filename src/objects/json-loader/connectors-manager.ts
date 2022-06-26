import { remove } from "lodash-es";
import { JSONSourceConnector } from "./json-source-connector";

class ConnectorsManager {
  protected connectors: { id: string; sourceId: string; connector: any }[];

  constructor() {
    this.connectors = [];
  }

  addConnector(id: string, sourceId: string, connector: any) {
    this.connectors.push({ id, sourceId, connector });
  }

  getConnector(id: string) {
    return this.connectors.find((conn) => conn.id === id)?.connector;
  }

  getConnectorBySourceId(sourceId: string) {
    return this.connectors.find((conn) => conn.sourceId === sourceId)
      ?.connector;
  }

  remove(id: string) {
    remove(this.connectors, (conn) => {
      return conn.id === id;
    });
  }
}

const connectorManager = new ConnectorsManager();

export function getOrCreateConnectorById(
  objectId: string,
  sourceId: string
): JSONSourceConnector {
  let conn = connectorManager.getConnector(objectId);

  if (conn) return conn;

  conn = new JSONSourceConnector();
  connectorManager.addConnector(objectId, sourceId, conn);
  return conn;
}

export function getConnectorBySourceId(sourceId: string): JSONSourceConnector {
  return connectorManager.getConnectorBySourceId(sourceId);
}
