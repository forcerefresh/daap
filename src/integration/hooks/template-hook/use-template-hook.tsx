// *** this file contains implementation for development

import { remove } from "lodash-es";
import { IPlayerData } from "../../../export/i-export-html";
import { v4 as uuid } from "uuid";

export const useTemplateHook = () => {
  const getTemplate = (id: string): Promise<any> => {
    const templates: any[] = JSON.parse(
      localStorage.getItem("templates") || "[]"
    );

    const template: any = templates.find((p) => p.id === id);

    return new Promise((resolve) => {
      resolve({ template });
    });
  };

  const getTemplates = (
    from: number,
    search: string,
    perPage = 10
  ): Promise<any> => {
    const templates: any[] = JSON.parse(
      localStorage.getItem("templates") || "[]"
    );

    templates.reverse();

    const retArr = templates
      .filter((item) => {
        return !search || item.name.indexOf(search) !== -1;
      })
      .splice(from, perPage);

    return new Promise((resolve) => {
      resolve({ templates: retArr });
    });
  };

  const deleteTemplate = (id: string): Promise<{ id: string }> => {
    let templates: any[] = JSON.parse(
      localStorage.getItem("templates") || "[]"
    );

    remove(templates, (template: any) => {
      return template.id === id;
    });

    localStorage.setItem("templates", JSON.stringify(templates));

    // player data
    // const exports = JSON.parse(localStorage.getItem("template-exports") || "{}");
    // delete exports[id];
    // localStorage.setItem("template-exports", JSON.stringify(exports));

    return Promise.resolve({ id });
  };

  const saveTemplate = ({
    name,
    description,
    slides,
    project,
    preview,
    playerData,
  }: {
    name: string;
    description?: string;
    slides?: number;
    created?: string;
    project: any;
    preview: any;
    playerData: IPlayerData;
    assetsUrls: {
      id?: string;
      filename?: string;
      url?: string;
      sourceType?: "local" | "library" | "url" | string;
    }[];
    extensions: any[];
  }): Promise<{
    id: string;
    name: string;
    description: string;
    slides: number;
    created: string;
  }> => {
    const templates = JSON.parse(localStorage.getItem("templates") || "[]");

    const created = new Date().getTime();
    const id = uuid();

    templates.push({
      id,
      name,
      description,
      slides,
      created,
      project,
      preview,
    });

    localStorage.setItem("templates", JSON.stringify(templates));

    // player data
    // const exports = JSON.parse(localStorage.getItem("template-exports") || "{}");
    // playerData.name = name;
    // exports[id] = playerData;
    // localStorage.setItem("template-exports", JSON.stringify(exports));

    return Promise.resolve({
      id,
      name,
      description: description!,
      slides: slides!,
      created: created.toString(),
    });
  };

  return {
    getTemplate,
    getTemplates,
    saveTemplate,
    deleteTemplate,
  };
};
