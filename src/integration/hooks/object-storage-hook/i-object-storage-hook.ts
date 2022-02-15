export interface ObjectStorageItem {
  id?: string;
  environment: "production" | "development" | "qa" | string;
  bucketName: string;
  key: string;
  secretKey: string;
  platform: "s3" | "linode" | "digitalocean" | string;
  playerStatus?: "uploaded" | "notUploaded";
  description?: string;
  assignedProject?: { projectId: number; revision?: number };
}
