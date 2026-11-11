export interface IClipboard {
  entityType: "object" | "layer" | "slide" | null;
  entityIds: string[] | null;
  operation: "cut" | "copy" | null;
}
