import React from "react";

/** IntegrationContext provides API for integration (wp, electron, etc...) */
export const IntegrationContext = React.createContext({
  useMediaHook: () => ({
    requestMedia: (type: "image" | "video"): Promise<{ url: string }> =>
      Promise.resolve({ url: "" }),
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

export const IntegrationContextProvider = (
  props: React.PropsWithChildren<React.ReactNode>
) => {
  return (
    <IntegrationContext.Provider
      value={{ useMediaHook: useMediaHookFactory() }}
    >
      {props.children}
    </IntegrationContext.Provider>
  );
};
