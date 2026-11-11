// *** this file contains implementation for development

import { remove } from "lodash-es";
import { v4 as uuid } from "uuid";
import { ITemplateHook, SaveTemplateArgs, Template } from "../../../integration/core/i-hooks";

export const useTemplateHook = (): ITemplateHook => {
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

    return Promise.resolve({ id });
  };

  const saveTemplate = ({ name, description, slides, project, preview }: SaveTemplateArgs): Promise<Template> => {
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

    return Promise.resolve({ id, name, description: description!, slides: slides!, created: created.toString() } as Template);
  };

  return {
    getTemplate,
    getTemplates,
    saveTemplate,
    deleteTemplate,
  };
};
