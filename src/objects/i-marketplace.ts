export interface IMarketItem {
  id: number;
  type: string;
  name: string;
  description: string;
  tags: string[];
  categories: string[];
  author: string;
  homepage?: {
    title?: string;
    url?: string;
  };
  support?: {
    title?: string;
    url?: string;
  };
  packageUrl: string;
  logoUrl: string;
  created: string;
  modified: string;
}
