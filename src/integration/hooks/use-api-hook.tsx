// *** this file contains implementation for development

import { forEach, forOwn, remove } from "lodash-es";

export const useAPIHook = () => {
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

    const retArr = projects.splice(from, from + perPage);

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
  }: {
    id?: number;
    name: string;
    description?: string;
    slides?: number;
    created?: string;
    modified?: string;
    project: any;
    preview: any;
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
  return { getProject, getProjects, saveProject, deleteProject };
};
