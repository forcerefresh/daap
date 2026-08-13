export interface DevelopmentItem {
  id: string;
  hash?: string;
  token: string;
  extensionType: "object" | "animation" | "plugin" | string;
  version: string;
  type: string; // TODO consider change name
  appDevUrl: string;
  playerDevUrl: string;
  monitoringEnabled?: boolean;
  status?: "" | "OK" | "ERROR";
  statusMessage?: string;
}
