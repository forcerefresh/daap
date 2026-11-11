export interface DragItem {
  index: number;
  id: string;
  type: string;
  draggingIds: string[];
}

export const ItemTypes = {
  OBJECT: "object",
};
