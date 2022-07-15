// *** this file contains implementation for development

import { remove } from "jszip";
import { IExtensionItem } from "../../../webslider-sdk/src/objects/i-extensions";

export const useExtensionsHook = () => {
  /* returns projects */
  const getInstalledMarketItems = (): Promise<{ items: IExtensionItem[] }> => {
    const marketItems: IExtensionItem[] = JSON.parse(
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
  ): Promise<{ items: IExtensionItem[] }> => {
    const apiUrl = `${process.env.REACT_APP_EXTENSIONS_BASE_URL}/api/v1`;
    let url = `${apiUrl}?from=${from}`;

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (tags && tags.length > 0) {
      url += `&tags=${tags.map((tag) => encodeURIComponent(tag)).join(",")}`;
    }
    return fetch(url).then((res) => res.json());
  };

  const installMarketItem = (
    marketItem: IExtensionItem
  ): Promise<IExtensionItem> => {
    const marketItems = JSON.parse(localStorage.getItem("marketItems") || "[]");

    marketItems.push(marketItem);

    localStorage.setItem("marketItems", JSON.stringify(marketItems));

    return Promise.resolve(marketItem);
  };

  const uninstallMarketItem = (id: number): Promise<IExtensionItem> => {
    const marketItems = JSON.parse(localStorage.getItem("marketItems") || "[]");

    const foundItem: IExtensionItem = marketItems.find((item: any) => {
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
