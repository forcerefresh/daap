export interface Industry {
  id: string;
  parentId: string;
  level: string;
  name: string;
  children: Industry[];
}

export interface IndustryWithChildren extends Industry {
  children: Industry[];
}
