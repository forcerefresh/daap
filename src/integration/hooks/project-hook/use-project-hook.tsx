// *** this file contains implementation for development

import { remove } from "lodash-es";
import { v4 as uuid } from "uuid";
import { IPlayerData } from "../../../export/i-export-html";
import { IStore } from "../../../store/store";
import { IProjectHook } from "../../../integration/core/i-hooks";

export const useProjectHook = (): IProjectHook => {
  const getProject = (id: string): Promise<any> => {
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

  const deleteProject = (id: string): Promise<{ id: string }> => {
    let projects: any[] = JSON.parse(localStorage.getItem("projects") || "[]");

    remove(projects, (project: any) => {
      return project.id === id;
    });

    localStorage.setItem("projects", JSON.stringify(projects));

    // player data
    const exports = JSON.parse(localStorage.getItem("exports") || "{}");
    delete exports[id];
    localStorage.setItem("exports", JSON.stringify(exports));

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id });
      }, 500);
    });
  };

  const _upsertProject = (id: string | undefined, { name, description, slides, project, preview, playerData }: { name: string; description?: string; slides?: number; project: Omit<IStore["project"], "diff">; preview: any; playerData: IPlayerData }): Promise<any> => {
    const projects = JSON.parse(localStorage.getItem("projects") || "[]");

    let projectItem;
    let projectItemIndex = -1;
    if (!id) {
      id = uuid();
    } else {
      projectItem = projects.find((p: any) => p.id === id);
      projectItemIndex = projects.indexOf(projectItem);
    }

    const modified = new Date().getTime();
    const created = projectItem ? projectItem.created : modified;
    const entry = { id, name, description, slides, created, modified, project, preview };

    if (projectItemIndex === -1) {
      projects.push(entry);
    } else {
      projects[projectItemIndex] = entry;
    }

    localStorage.setItem("projects", JSON.stringify(projects));

    const exports = JSON.parse(localStorage.getItem("exports") || "{}");
    playerData.name = name;
    exports[id] = playerData;
    localStorage.setItem("exports", JSON.stringify(exports));

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: id!, name, description, slides, created: created.toString(), modified: modified.toString(), saveRevision: 0, assetsUrls: [] });
      }, 500);
    });
  };

  const createProject = (args: any): Promise<any> => _upsertProject(undefined, args);

  const updateProject = (id: string, args: any): Promise<any> => _upsertProject(id, args);

  return {
    getProject,
    getProjects,
    createProject,
    updateProject,
    deleteProject,
  };
};
