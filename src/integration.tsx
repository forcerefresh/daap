import React from "react";

/** IntegrationContext provides API for integration (wp, electron, etc...) */
export const IntegrationContext = React.createContext({
  useMediaHook: () => ({
    requestMedia: (type: "image" | "video"): Promise<{ url: string }> =>
      Promise.resolve({ url: "" }),
  }),

  useAPIHook: () => ({
    /* returns project */
    getProject: (id: number): Promise<any> => Promise.resolve({}), // todo: add interface for api response

    /* returns projects */
    getProjects: (from: number, search: string): Promise<any> =>
      Promise.resolve({}), // todo: add interface for api response

    /* delete project */
    deleteProject: (id: number): Promise<any> => Promise.resolve({}), // todo: add interface for api response

    /* save project */
    saveProject: ({
      id,
      name,
      description,
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
      preview: {
        width: number;
        height: number;
        scale: number;
        html: string;
      };
    }): Promise<{
      id: number;
      name: string;
      description: string;
      slides: number;
      created: string;
      modified: string;
    }> =>
      Promise.resolve({
        id: 1,
        name: "",
        description: "",
        slides: 0,
        created: "",
        modified: "",
      }), // todo: add interface for api response
  }),
});

// *** PUBLIC INTEGRATION FACTORY FUNCTIONS ***

/** return selector for app holder */
export function useAppRootSelector() {
  if (process.env.REACT_APP_INTEGRATION === "wp") {
    return "WebSlider-RootContainer";
  } else {
    return "root";
  }
}

// *** PRIVATE INTEGRATION FACTORY FUNCTIONS ***

function useMediaHookFactory() {
  if (process.env.REACT_APP_INTEGRATION === "wp") {
    return require("./integration/hooks/wp-use-media-hook").useMediaHook;
  } else {
    return require("./integration/hooks/use-media-hook").useMediaHook;
  }
}

function useAPIHookFactory() {
  if (process.env.REACT_APP_INTEGRATION === "wp") {
    return require("./integration/hooks/wp-use-api-hook").useAPIHook;
  }
  if (process.env.REACT_APP_INTEGRATION === "electron") {
    return require("./integration/hooks/electron-use-api-hook").useAPIHook;
  } else {
    return require("./integration/hooks/use-api-hook").useAPIHook;
  }
}

export const IntegrationContextProvider = (
  props: React.PropsWithChildren<React.ReactNode>
) => {
  return (
    <IntegrationContext.Provider
      value={{
        useMediaHook: useMediaHookFactory(),
        useAPIHook: useAPIHookFactory(),
      }}
    >
      {props.children}
    </IntegrationContext.Provider>
  );
};
