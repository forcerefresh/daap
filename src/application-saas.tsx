import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import cx from "classnames";
import ReactDOM from "react-dom";
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
import { Button, HotkeysProvider, PortalProvider } from "@blueprintjs/core";
import DaapLogo from "./integration/components/main-header/daap-logo.svg?react";
// import "in-app-guide/src/style.css";
import { ExportProvider } from "./utils/export-provider/ExportProvider";
import SearchPage from "./pages/search/search";
import AccountButton from "./integration/components/main-header/AccountButton";
import { zIndex } from "html2canvas/dist/types/css/property-descriptors/z-index";
import "./AppNew.scss";

// const inAppGuide = require("in-app-guide");

const global = window as any;

const Editor = (props: ReturnType<typeof mapStateToProps>) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  // const { userData } = props;
  // const siteHolderRef = useRef<HTMLDivElement | null>(null);
  // const [showEditor, setShowEditor] = useState(false);

  // useLayoutEffect(() => {
  //   setShowEditor(!!userData);
  // }, [userData]);

  // useLayoutEffect(() => {
  //   setShowEditor(!!userData);
  // }, [userData]);

  // const focusApp = (initiarot: string) => {
  //   // siteHolderRef.current!.style.display = "none";
  //   setShowEditor(true);
  // };

  // const [renderSite, setRenderSite] = useState(true);
  // useEffect(() => {
  //   setTimeout(() => {
  //     setRenderSite(false);
  //   }, 500);
  // }, [showEditor]);

  // useEffect(() => {
  //   const tourData = [
  //     {
  //       target: "element1",
  //       title: "Step 1: Introduction",
  //       description:
  //         "Welcome to our website! This is the first step of the tour.",
  //       position: "bottom-center",
  //     },
  //     {
  //       target: "element2",
  //       title: "Step 2: Introduction",
  //       description:
  //         "Welcome to our website! This is the second step of the tour.",
  //       position: "bottom-center",
  //     },
  //   ];
  //   inAppGuide.initializeTourData(tourData);

  //   setTimeout(() => {
  //     return;
  // const el = document.getElementById("element2");
  // const bounds = el?.getBoundingClientRect();
  // var w = window.innerWidth;
  // var h = window.innerHeight;

  // const bl = bounds?.left;
  // const bt = bounds?.top;

  // const br = w - (bounds?.left + bounds?.width);
  // const bb = h - (bounds?.top + bounds?.height);

  // overlayRef.current!.style!.position = "absolute";
  // overlayRef.current!.style!.background = overlayRef.current!.style!.left =
  //   "0";
  // overlayRef.current!.style!.top = "0";
  // overlayRef.current!.style!.right = "0";
  // overlayRef.current!.style!.bottom = "0";
  // overlayRef.current!.style!.zIndex = "20000";
  // overlayRef.current!.style!.borderLeft = `${bl}px solid rgba(1,1,1,0.5)`;
  // overlayRef.current!.style!.borderTop = `${bt}px solid rgba(1,1,1,0.5)`;
  // overlayRef.current!.style!.borderRight = `${br}px solid rgba(1,1,1,0.5)`;
  // overlayRef.current!.style!.borderBottom = `${bb}px solid rgba(1,1,1,0.5)`;
  //  = {
  //   position: "absolute",
  //   background:
  //   left: "0",
  //   top: "0",
  //   right: "0",

  //   bottom: "0",
  // };
  // Start the tour when the component mounts
  // inAppGuide.showStep(1);
  //   }, 1000);
  // }, []);

  const [portalRoot, setPortalRoot] = useState<any>();

  useEffect(() => {
    setPortalRoot(
      document.getElementsByClassName("daap-forcerefresh-app")?.[0]
    );
  });

  const [searchVisible, setSearchVisible] = useState(true);

  return (
    <PortalProvider portalContainer={portalRoot}>
      <DevelopmentContextProvider>
        <IntegrationContextProvider>
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
              <Route
                path="/search"
                element={<SearchPage onClose={() => setSearchVisible(false)} />}
              />
            </Routes>
          </BrowserRouter>

          {/* <BrowserRouter>
            <Routes>
              <Route path="search" element={<Login />} />
              <Route index element={<EditorConnected />} />
            </Routes>
          </BrowserRouter> */}
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
