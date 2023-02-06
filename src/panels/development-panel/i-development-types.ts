export interface DevelopmentItem {
  id: string;
  hash?: string;
  token: string;
  componentType: "object" | "animation" | string;
  type: string; // TODO consider change name
  appDevUrl: string;
  playerDevUrl: string;
  monitoringEnabled?: boolean;
  status?: "" | "OK" | "ERROR";
  statusMessage?: string;
}
