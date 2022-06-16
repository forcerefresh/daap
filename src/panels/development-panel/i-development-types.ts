export interface DevelopmentItem {
  id: string;
  componentType: string;
  type: string; // TODO consider change name
  devUrl: string;
  monitoringEnabled?: boolean;
  status?: "" | "OK" | "ERROR";
  statusMessage?: string;
}
