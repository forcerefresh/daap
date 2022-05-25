// *** this file contains implementation for development

import { remove } from "jszip";
import { IMarketItem } from "../../../objects/i-marketplace";

export const useMarketplaceHook = () => {
  /* returns projects */
  const getInstalledMarketItems = (): Promise<{ items: IMarketItem[] }> => {
    const marketItems: IMarketItem[] = JSON.parse(
      localStorage.getItem("marketItems") || "[]"
    );

    return new Promise((resolve) => {
      resolve({ items: marketItems });
    });
  };

  /* returns projects */
  const getMarketItems = (
    from: number,
    search?: string,
    tags?: string[]
  ): Promise<{ items: IMarketItem[] }> => {
    const apiUrl = `${process.env.REACT_APP_MARKETPLACE_BASE_URL}/api/v1`;
    let url = `${apiUrl}?from=${from}`;

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (tags && tags.length > 0) {
      url += `&tags=${tags.map((tag) => encodeURIComponent(tag)).join(",")}`;
    }
    return fetch(url).then((res) => res.json());
  };

  const installMarketItem = (marketItem: IMarketItem): Promise<IMarketItem> => {
    const marketItems = JSON.parse(localStorage.getItem("marketItems") || "[]");

    marketItems.push(marketItem);

    localStorage.setItem("marketItems", JSON.stringify(marketItems));

    return Promise.resolve(marketItem);
  };

  const uninstallMarketItem = (id: number): Promise<IMarketItem> => {
    const marketItems = JSON.parse(localStorage.getItem("marketItems") || "[]");

    const foundItem: IMarketItem = marketItems.find((item: any) => {
      return item.id === id;
    });

    const newMarketItems = marketItems.filter((item: any) => {
      return item.id !== id;
    });

    localStorage.setItem("marketItems", JSON.stringify(newMarketItems));

    return Promise.resolve(foundItem);
  };

  return {
    getInstalledMarketItems,
    getMarketItems,
    installMarketItem,
    uninstallMarketItem,
  };
};
