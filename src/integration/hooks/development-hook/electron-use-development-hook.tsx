import { useContext, useState } from "react";
import { DevelopmentItem } from "../../../panels/development-panel/i-development-types";
import { DevelopmentContext } from "../../../utils/development/DevelopmentProvider";

export const useDevelopmentHook = () => {
  // NOTE: update state on all action to keep state up to date
  // NOTE: this is used to trigger object/animation re-register
  const { developmentItems: _developmentItems, setDevelopmentItems } =
    useContext(DevelopmentContext);

  const getAll = (): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer
        .invoke("Development::GetAllDevelopmentItems")
        .then((result: any) => {
          setDevelopmentItems(result);
          resolve(result);
        });
    });
  };

  const addDevelopmentItem = (item: DevelopmentItem): Promise<void> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer
        .invoke("Development::AddDevelopmentItem", JSON.stringify(item))
        .then((result: any) => {
          setDevelopmentItems(result);
          resolve(result);
        });
    });
  };

  const updateDevelopmentItem = (
    item: Partial<DevelopmentItem>
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer
        .invoke("Development::UpdateDevelopmentItem", JSON.stringify(item))
        .then((result: any) => {
          setDevelopmentItems(result);
          resolve(result);
        });
    });
  };

  const deleteDevelopmentItem = (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const { ipcRenderer } = window.require("electron");

      ipcRenderer
        .invoke("Development::DeleteDevelopmentItem", JSON.stringify({ id }))
        .then((result: any) => {
          setDevelopmentItems(result);
          resolve(result);
        });
    });
  };

  return {
    getAll,
    addDevelopmentItem,
    updateDevelopmentItem,
    deleteDevelopmentItem,
  };
};
