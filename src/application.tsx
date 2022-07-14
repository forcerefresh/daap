import "./objects/exec-code-effect";
import React from "react";
import ReactDOM from "react-dom";
import "./application.css";
import App from "./App";
import { store } from "./store/store";
import { Provider } from "react-redux";
import * as serviceWorker from "./serviceWorker";
import { IntegrationContextProvider, useAppRootSelector } from "./integration";
import "./objects/register-object";
import "./objects/font-preloader";
import {
  registerExternalObject,
  unregisterObject,
} from "./webslider-sdk/src/objects/objects-register";
import DevelopmentManager from "./utils/development/DevelopmentManager";
import { DevelopmentContextProvider } from "./utils/development/DevelopmentProvider";
import { PreviewTimelineContextProvider } from "./utils/preview-timeline-provider/PreviewTimelineProvider";
import { logger } from "./webslider-sdk/src/utils/logger/logger";

function application(): {
  component: React.ReactElement;
  useAppRootSelector: any;
} {
  logger.debug("RENDER STAGE PANEL");

  return {
    component: (
      <React.StrictMode>
        <DevelopmentContextProvider>
          <IntegrationContextProvider>
            <Provider store={store}>
              <DevelopmentManager />
              <PreviewTimelineContextProvider>
                <App />
              </PreviewTimelineContextProvider>
            </Provider>
          </IntegrationContextProvider>
        </DevelopmentContextProvider>
      </React.StrictMode>
    ),
    useAppRootSelector: useAppRootSelector,
  };
}

const data = application();
ReactDOM.render(
  data.component,
  document.getElementById((data.useAppRootSelector as any)())
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

if (!(window as any).WebSlider_GlobalScope) {
  (window as any).WebSlider_GlobalScope = {};
}
(window as any).WebSlider_GlobalScope.registerExternalObject =
  registerExternalObject;

(window as any).WebSlider_GlobalScope.unregisterObject = unregisterObject;
