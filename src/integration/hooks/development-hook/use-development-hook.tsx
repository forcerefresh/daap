import { useContext, useState } from "react";
import { DevelopmentItem } from "../../../panels/development-panel/i-development-types";
import { DevelopmentContext } from "../../../utils/development/DevelopmentProvider";

export const useDevelopmentHook = () => {
  // NOTE: update state on all action to keep state up to date
  // NOTE: this is used to trigger object/effect re-register
  const { developmentItems: _developmentItems, setDevelopmentItems } =
    useContext(DevelopmentContext);

  const getAll = (): Promise<any[]> => {
    const items = JSON.parse(localStorage.getItem(`development`) || "[]");

    setDevelopmentItems(items);

    return Promise.resolve(items);
  };

  const addDevelopmentItem = (item: DevelopmentItem): Promise<void> => {
    const items = JSON.parse(localStorage.getItem(`development`) || "[]");

    items.push(item);

    setDevelopmentItems(items);

    localStorage.setItem(`development`, JSON.stringify(items));

    return Promise.resolve();
  };

  const updateDevelopmentItem = (
    item: Partial<DevelopmentItem>
  ): Promise<void> => {
    const items: DevelopmentItem[] = JSON.parse(
      localStorage.getItem(`development`) || "[]"
    );

    const itemIndex = items.findIndex((curr) => curr.id === item.id);
    items[itemIndex] = { ...items[itemIndex], ...item };

    console.log(items);
    setDevelopmentItems(items);

    localStorage.setItem(`development`, JSON.stringify(items));

    return Promise.resolve();
  };

  const deleteDevelopmentItem = (id: string): Promise<void> => {
    let items: DevelopmentItem[] = JSON.parse(
      localStorage.getItem(`development`) || "[]"
    );

    items = items.filter((curr) => curr.id !== id);

    setDevelopmentItems(items);

    localStorage.setItem(`development`, JSON.stringify(items));

    return Promise.resolve();
  };

  return {
    getAll,
    addDevelopmentItem,
    updateDevelopmentItem,
    deleteDevelopmentItem,
  };
};
