// *** this file contains implementation for development

import { forEach, remove } from "lodash-es";
import { IPlayerData } from "../../../export/i-export-html";
import { IStore } from "../../../store/store";
import { IExtensionItem } from "webslider-sdk2/lib/objects/i-extensions";
import { GetAssetsUrlFuncReturnType } from "webslider-sdk2/lib/objects/objects-register";

export const useProjectHook = () => {
  const getNextProjectId = (): Promise<number> => {
    const projects: any[] = JSON.parse(
      localStorage.getItem("projects") || "[]"
    );

    let maxId = 1;

    projects.forEach((p) => {
      maxId = Math.max(maxId, p.id);
    });

    return new Promise((resolve) => {
      resolve(maxId + 1);
    });
  };

  const getProject = (id: number): Promise<any> => {
    const projects: any[] = JSON.parse(
      localStorage.getItem("projects") || "[]"
    );

    const project: any = projects.find((p) => p.id === id);

    return new Promise((resolve) => {
      resolve({ project });
    });
  };

  const getProjects = (
    from: number,
    search: string,
    perPage = 10
  ): Promise<any> => {
    const projects: any[] = JSON.parse(
      localStorage.getItem("projects") || "[]"
    );

    projects.reverse();

    const retArr = projects
      .filter((item) => {
        return !search || item.name.indexOf(search) !== -1;
      })
      .splice(from, perPage);

    return new Promise((resolve) => {
      resolve({ projects: retArr });
    });
  };

  const deleteProject = (id: number): Promise<{ id: number }> => {
    let projects: any[] = JSON.parse(localStorage.getItem("projects") || "[]");

    remove(projects, (project: any) => {
      return project.id === id;
    });

    localStorage.setItem("projects", JSON.stringify(projects));

    // player data
    const exports = JSON.parse(localStorage.getItem("exports") || "{}");
    delete exports[id];
    localStorage.setItem("exports", JSON.stringify(exports));

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        //reject(); // use reject to simulate error
        resolve({ id });
      }, 500); // use timeout to simulate real network network
    });
  };

  const saveProject = ({
    id,
    name,
    description,
    slides,
    project,
    preview,
    playerData,
  }: {
    id?: number;
    name: string;
    description?: string;
    slides?: number;
    created?: string;
    modified?: string;
    project: Omit<IStore["project"], "diff">;
    preview: {
      width: number;
      height: number;
      scale: number;
      html: string;
    };
    playerData: IPlayerData;
    assetsUrls: GetAssetsUrlFuncReturnType;
    extensions: IExtensionItem[];
  }): Promise<{
    id: number;
    name: string;
    description: string;
    slides: number;
    created: string;
    modified: string;
  }> => {
    const projects = JSON.parse(localStorage.getItem("projects") || "[]");

    let projectItem;
    let projectItemIndex = -1;
    if (!id) {
      id = 0;
      forEach(projects, (project) => {
        id = Math.max(parseInt(project.id), id!);
      });
      id++;
    } else {
      projectItem = projects.find((p: any) => p.id === id);
      projectItemIndex = projects.indexOf(projectItem);
    }

    const modified = new Date().getTime();
    const created = projectItem ? projectItem.created : modified;

    if (projectItemIndex === -1) {
      projects.push({
        id,
        name,
        description,
        slides,
        created,
        modified,
        project,
        preview,
      });
    } else {
      projects![projectItemIndex] = {
        id,
        name,
        description,
        slides,
        created,
        modified,
        project,
        preview,
      };
    }

    localStorage.setItem("projects", JSON.stringify(projects));

    // player data
    const exports = JSON.parse(localStorage.getItem("exports") || "{}");
    playerData.name = name;
    exports[id] = playerData;
    localStorage.setItem("exports", JSON.stringify(exports));

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        //reject(); // use reject to simulate error
        resolve({
          id: id!,
          name,
          description: description!,
          slides: slides!,
          created: created.toString(),
          modified: modified!.toString(),
        });
      }, 500); // use timeout to simulate real network network
    });
  };

  return {
    getProject,
    getProjects,
    saveProject,
    deleteProject,
    getNextProjectId,
  };
};
