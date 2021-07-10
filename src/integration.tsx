import React from "react";

/** IntegrationContext provides API for integration (wp, electron, etc...) */
export const IntegrationContext = React.createContext({
  useMediaHook: () => ({
    requestMedia: (type: "image" | "video"): Promise<{ url: string }> =>
      Promise.resolve({ url: "" }),
  }),

  useAPIHook: () => ({
    getProjects: (from: number, search: string): Promise<any> =>
      Promise.resolve({}), // todo: add interface for api response
    saveProject: ({
      id,
      name,
      description,
      project,
    }: {
      id?: number;
      name: string;
      description?: string;
      project: any;
    }): Promise<{ id: number; name: string; description: string }> =>
      Promise.resolve({ id: 1, name: "", description: "" }), // todo: add interface for api response
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
