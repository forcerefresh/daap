import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { store } from "./store/store";
import { Provider } from "react-redux";
import * as serviceWorker from "./serviceWorker";
import { IntegrationContextProvider, useAppRootSelector } from "./integration";
import "./objects/register-object";
import "./animations/register-animation";
import "./objects/font-preloader";
import {
  registerExternalObject,
  unregisterObject,
} from "webslider-sdk/lib/objects/objects-register";
import DevelopmentManager from "./utils/development/DevelopmentManager";
import { DevelopmentContextProvider } from "./utils/development/DevelopmentProvider";
import { PreviewTimelineContextProvider } from "./utils/preview-timeline-provider/PreviewTimelineProvider";
import {
  registerExternalAnimation,
  unregisterAnimation,
} from "webslider-sdk/lib/animations/animations-register";
import css from "./App.module.scss";

const global = window as any;

function application(): {
  component: React.ReactElement;
  useAppRootSelector: any;
} {
  return {
    component: (
      <React.StrictMode>
        <DevelopmentContextProvider>
          <IntegrationContextProvider>
            <Provider store={store}>
              <DevelopmentManager />
              <PreviewTimelineContextProvider>
                <App className={css.editor100} />
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

if (!global.WebSlider_GlobalScope) {
  global.WebSlider_GlobalScope = {};
}

// EXTERNAL OBJECT REGISTER
global.WebSlider_GlobalScope.registerExternalObject = registerExternalObject;

// EXTERNAL OBJECT UNREGISTER
global.WebSlider_GlobalScope.unregisterObject = unregisterObject;

// EXTERNAL EFFECT REGISTER
global.WebSlider_GlobalScope.registerExternalAnimation =
  registerExternalAnimation;

// EXTERNAL EFFECT UNREGISTER
global.WebSlider_GlobalScope.unregisterAnimation = unregisterAnimation;
