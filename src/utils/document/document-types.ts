export interface Document {
  id: string;
  parentId: string;
  level: string;
  name: string;
  children: Document[];
}
