// *** this file contains implementation for development

import { forOwn } from "lodash-es";

export const useAPIHook = () => {
  const getProjects = (from: number, search: string): Promise<any> => {
    const projects = JSON.parse(localStorage.getItem("projects") || "{}");

    return new Promise((resolve) => {
      resolve({ projects: Object.values(projects) });
    });
  };

  const saveProject = ({
    id,
    name,
    description,
    project,
  }: {
    id?: number;
    name: string;
    description?: string;
    project: any;
  }): Promise<{ id: number; name: string; description: string }> => {
    const projects = JSON.parse(localStorage.getItem("projects") || "{}");

    if (!id) {
      id = 0;
      forOwn(projects, (_value, key) => {
        id = Math.max(parseInt(key), id!);
      });
      id++;
    }

    projects![`${id}`] = {
      id,
      name,
      description,
      project,
    };

    localStorage.setItem("projects", JSON.stringify(projects));

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: id!, name, description: description! });
      }, 1000);
    });
  };
  return { getProjects, saveProject };
};
