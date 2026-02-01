import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  MemoryRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import cx from "classnames";
import App from "./App";
import { IStore, store } from "./store/store";
import { connect, Provider } from "react-redux";
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
import MainHeader from "./integration/components/main-header/SassMainHeader";
import { HotkeysProvider, PortalProvider } from "@blueprintjs/core";
// import "in-app-guide/src/style.css";
import { ExportProvider } from "./utils/export-provider/ExportProvider";
import SearchPage from "./pages/search/search";

import IntroPage from "./pages/intro/Intro";

import "./AppNew.scss";

const global = window as any;

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
        <DevelopmentManager />
        <ExportProvider>
          <PreviewTimelineContextProvider>
            <div className={cx(css.main, "daap-forcerefresh-app")}>
              <div>
                <MainHeader className={css.saasHeader} />
                <App className={css.editor} />
              </div>
            </div>
            <div ref={overlayRef} />
          </PreviewTimelineContextProvider>
        </ExportProvider>
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
  const homePage = window.daapForcerefreshSettings?.homePage || "intro";

  return {
    component: (
      // <React.StrictMode>
      <MemoryRouter initialEntries={[`/${homePage}`]}>
        <Provider store={store}>
          <IntegrationContextProvider>
            <HotkeysProvider>
              <Routes>
                <Route path="/" element={<Navigate to="/search" />} />
                <Route path="/intro" element={<IntroPage />} />
                <Route path="/editor" element={<EditorConnected />} />
                <Route path="/search" element={<SearchPage />} />
                {/* ADD THIS CATCH-ALL ROUTE */}
                <Route
                  path="*"
                  element={
                    <div style={{ padding: "20px" }}>
                      {/* You can redirect to search or show the Editor */}
                      <Navigate to="/search" replace />
                      {/* OR show Editor directly: */}
                      {/* <EditorConnected /> */}
                    </div>
                  }
                />
              </Routes>
            </HotkeysProvider>
          </IntegrationContextProvider>
        </Provider>
      </MemoryRouter>

      // </React.StrictMode>
    ),
    useAppRootSelector: useAppRootSelector,
  };
}

const data = application();

const container = document.getElementById((data.useAppRootSelector as any)());
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(data.component);

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
