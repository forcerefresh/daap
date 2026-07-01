import React, { useEffect, useRef, useState } from "react";
// import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import cx from "classnames";
import ReactDOM from "react-dom";

import App from "./App";
import { IStore, store } from "./store/store";
import { connect, Provider } from "react-redux";
import * as serviceWorker from "./serviceWorker";
import { IntegrationContextProvider, useAppRootSelector } from "./integration";
import "./objects/register-object";
// import "./animations/register-animation";
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
import MainHeader from "./integration/components/main-header/SassMainHeader";
import { HotkeysProvider, PortalProvider } from "@blueprintjs/core";
// import "in-app-guide/src/style.css";
import { ExportProvider } from "./utils/export-provider/ExportProvider";
import SearchPage from "./pages/search/search";

import "./AppNew.scss";
import MobileRestriction from "./integration/components/mobile-restriction/MobileRestriction";
import { IGlobals } from "./globals";

const global = window as unknown as IGlobals;

const Editor = (props: ReturnType<typeof mapStateToProps>) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const [portalRoot, setPortalRoot] = useState<any>();

  useEffect(() => {
    setPortalRoot(
      document.getElementsByClassName("daap-forcerefresh-app")?.[0],
    );
  });

  return (
    <PortalProvider portalContainer={portalRoot}>
      <DevelopmentContextProvider>
        <IntegrationContextProvider>
          <DevelopmentManager />
          <ExportProvider>
            <PreviewTimelineContextProvider>
              <div className={cx(css.main, "daap-forcerefresh-app")}>
                <MobileRestriction />
                <div>
                  <MainHeader className={css.saasHeader} />
                  <App className={css.editor} />
                </div>
              </div>
              <div ref={overlayRef} />
            </PreviewTimelineContextProvider>
          </ExportProvider>
        </IntegrationContextProvider>
      </DevelopmentContextProvider>
    </PortalProvider>
  );
};

function mapStateToProps(state: IStore) {
  return { userData: state.account.userData };
}

const EditorConnected = connect(mapStateToProps)(Editor);

function application(): {
  component: React.ReactElement;
  useAppRootSelector: any;
} {
  return {
    component: (
      // <React.StrictMode>
      <Provider store={store}>
        <HotkeysProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/search" />} />
              <Route path="/editor" element={<EditorConnected />} />
              <Route path="/search" element={<SearchPage />} />
            </Routes>
          </BrowserRouter>
        </HotkeysProvider>
      </Provider>
      // </React.StrictMode>
    ),
    useAppRootSelector: useAppRootSelector,
  };
}

const data = application();
ReactDOM.render(
  data.component,
  document.getElementById((data.useAppRootSelector as any)()),
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
